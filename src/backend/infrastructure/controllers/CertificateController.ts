import { VercelRequest, VercelResponse } from '@vercel/node';
import PDFDocument from 'pdfkit';
import { PrismaEnrollmentRepository } from '../repositories/PrismaEnrollmentRepository.js';
import { PrismaCourseRepository } from '../repositories/PrismaCourseRepository.js';
import { prisma } from '../prisma.js';

const enrollmentRepository = new PrismaEnrollmentRepository();
const courseRepository = new PrismaCourseRepository();

export class CertificateController {
  static async download(req: VercelRequest, res: VercelResponse) {
    const { studentId, courseId } = req.query;

    if (!studentId || typeof studentId !== 'string' || !courseId || typeof courseId !== 'string') {
      return res.status(400).json({ data: null, error: 'Missing parameters' });
    }

    try {
      // 1. Verify Enrollment and Completion
      const enrollment = await enrollmentRepository.findByStudentAndCourse(studentId, courseId);
      
      if (!enrollment) {
        return res.status(404).json({ data: null, error: 'Inscripción no encontrada' });
      }

      if (enrollment.progress < 100) {
        return res.status(403).json({ data: null, error: 'El curso no está completado al 100%' });
      }

      // 2. Fetch Course and User details
      const course = await courseRepository.findById(courseId);
      const user = await prisma.user.findUnique({ where: { id: studentId } });

      if (!course || !user) {
        return res.status(404).json({ data: null, error: 'Curso o usuario no encontrado' });
      }

      // 3. Generate PDF
      const doc = new PDFDocument({
        layout: 'landscape',
        size: 'A4',
      });

      // Set headers for file download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=certificado-${courseId}.pdf`);

      // Pipe the PDF into the response
      doc.pipe(res);

      // --- Certificate Design ---
      
      // Background (Optional: simple border)
      doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke();

      // Header
      doc.font('Helvetica-Bold').fontSize(30).text('CERTIFICADO DE FINALIZACIÓN', {
        align: 'center',
        underline: true
      });
      
      doc.moveDown();
      doc.moveDown();

      // Body
      doc.font('Helvetica').fontSize(20).text('Este certificado se otorga a:', {
        align: 'center'
      });

      doc.moveDown();
      doc.font('Helvetica-Bold').fontSize(25).text(user.name, {
        align: 'center'
      });

      doc.moveDown();
      doc.font('Helvetica').fontSize(20).text('Por haber completado satisfactoriamente el curso:', {
        align: 'center'
      });

      doc.moveDown();
      doc.font('Helvetica-Bold').fontSize(25).text(course.title, {
        align: 'center'
      });

      doc.moveDown();
      doc.moveDown();

      // Footer
      const date = new Date().toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      doc.font('Helvetica').fontSize(15).text(`Fecha de emisión: ${date}`, {
        align: 'center'
      });

      doc.moveDown();
      doc.fontSize(12).text('SkillFlow LMS', {
        align: 'center'
      });

      // Finalize PDF file
      doc.end();

    } catch (error) {
      console.error('Error generating certificate:', error);
      // If headers are already sent, we can't send a JSON error.
      if (!res.headersSent) {
        res.status(500).json({ data: null, error: 'Error al generar el certificado' });
      }
    }
  }
}

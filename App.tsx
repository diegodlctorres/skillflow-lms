import React, { useState } from "react";
import {
    Check,
    Command,
    Copy,
    FileText,
    FolderOpen,
    Menu,
    Search,
    X,
} from "lucide-react";
import { Toaster, toast } from "sonner";

type MarkdownDocument = {
    name: string;
    content: string;
};

const DocumentHub: React.FC<{ documents: MarkdownDocument[] }> = ({
    documents,
}) => {
    const [selectedName, setSelectedName] = useState(documents[0]?.name || "");
    const [query, setQuery] = useState("");
    const [copied, setCopied] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const selectedDocument =
        documents.find((document) => document.name === selectedName) ||
        documents[0];
    const filteredDocuments = documents.filter((document) =>
        document.name.toLowerCase().includes(query.toLowerCase()),
    );

    const copyMarkdown = async () => {
        if (!selectedDocument) return;

        try {
            if (
                navigator.clipboard?.write &&
                typeof ClipboardItem !== "undefined"
            ) {
                const plainText = new Blob([selectedDocument.content], {
                    type: "text/plain",
                });
                await navigator.clipboard.write([
                    new ClipboardItem({ "text/plain": plainText }),
                ]);
            } else {
                await navigator.clipboard.writeText(selectedDocument.content);
            }
        } catch {
            const textarea = document.createElement("textarea");
            textarea.value = selectedDocument.content;
            textarea.setAttribute("readonly", "true");
            textarea.style.position = "fixed";
            textarea.style.opacity = "0";
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand("copy");
            document.body.removeChild(textarea);
        }

        setCopied(true);
        toast.success("Texto original copiado al portapapeles");
        window.setTimeout(() => setCopied(false), 1800);
    };

    const selectDocument = (name: string) => {
        setSelectedName(name);
        setCopied(false);
        setSidebarOpen(false);
    };

    return (
        <div className="min-h-screen bg-[#f4f6f8] text-slate-900 selection:bg-cyan-200 selection:text-slate-900">
            <header className="border-b border-slate-800 bg-[#101923] text-white">
                <div className="mx-auto flex h-[76px] max-w-[1500px] items-center justify-between px-5 lg:px-10">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-400 text-[#101923] shadow-[0_0_22px_rgba(34,211,238,0.25)]">
                            <FolderOpen size={21} strokeWidth={2.4} />
                        </div>
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-300">
                                SkillFlow / Workspace
                            </p>
                            <h1 className="text-lg font-semibold tracking-tight">
                                Regulatorios &amp; Contabilidad
                            </h1>
                            <p className="mt-0.5 text-[11px] font-medium text-slate-400">
                                Versión de publicación 2.0.1
                            </p>
                        </div>
                    </div>
                    <div className="hidden items-center gap-2 text-xs text-slate-400 sm:flex">
                        <Command size={14} />
                        <span>{documents.length} documentos disponibles</span>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="rounded-md p-2 text-slate-300 hover:bg-white/10 lg:hidden"
                        aria-label="Abrir documentos"
                    >
                        <Menu size={22} />
                    </button>
                </div>
            </header>

            <div className="mx-auto flex max-w-[1500px] px-5 lg:px-10">
                {sidebarOpen && (
                    <button
                        className="fixed inset-0 z-30 bg-slate-950/50 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                        aria-label="Cerrar menú"
                    />
                )}
                <aside
                    className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 z-40 w-[310px] border-r border-slate-200 bg-white px-5 py-6 shadow-xl transition-transform lg:static lg:z-0 lg:block lg:w-[310px] lg:shrink-0 lg:-translate-x-0 lg:bg-transparent lg:px-0 lg:pr-8 lg:shadow-none`}
                >
                    <div className="mb-7 flex items-center justify-between lg:hidden">
                        <span className="font-semibold">Documentos</span>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            aria-label="Cerrar documentos"
                        >
                            <X size={20} />
                        </button>
                    </div>
                    <div className="mb-6 pt-1 lg:pt-9">
                        <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                            Biblioteca
                        </p>
                        <p className="text-sm text-slate-500">
                            Archivos Markdown de la carpeta fuente
                        </p>
                    </div>
                    <label className="relative mb-5 block">
                        <Search
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Buscar archivo..."
                            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                        />
                    </label>
                    <nav className="space-y-1" aria-label="Archivos Markdown">
                        {filteredDocuments.map((document) => (
                            <button
                                key={document.name}
                                onClick={() => selectDocument(document.name)}
                                className={`group flex min-w-0 w-full items-start gap-3 rounded-lg px-3 py-3 text-left transition ${selectedDocument?.name === document.name ? "bg-[#102b3b] text-white shadow-sm" : "text-slate-600 hover:bg-white hover:text-slate-900"}`}
                            >
                                <FileText
                                    size={17}
                                    className={`mt-0.5 shrink-0 ${selectedDocument?.name === document.name ? "text-cyan-300" : "text-slate-400 group-hover:text-cyan-600"}`}
                                />
                                <span className="min-w-0 break-all text-[13px] leading-5">
                                    {document.name}
                                </span>
                            </button>
                        ))}
                        {filteredDocuments.length === 0 && (
                            <p className="px-3 py-4 text-sm text-slate-500">
                                No se encontraron archivos.
                            </p>
                        )}
                    </nav>
                </aside>

                <main className="min-w-0 flex-1 pb-16 lg:pl-10">
                    {selectedDocument ? (
                        <>
                            <div className="flex flex-col gap-5 border-b border-slate-200 py-8 sm:flex-row sm:items-end sm:justify-between lg:pt-12">
                                <div className="min-w-0">
                                    <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">
                                        <FileText size={15} /> Markdown
                                    </div>
                                    <h2 className="break-words text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                                        {selectedDocument.name}
                                    </h2>
                                    <p className="mt-2 text-sm text-slate-500">
                                        Contenido fuente listo para copiar y
                                        pegar.
                                    </p>
                                </div>
                                <button
                                    onClick={copyMarkdown}
                                    className={`flex shrink-0 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${copied ? "bg-emerald-600 text-white" : "bg-[#102b3b] text-white hover:bg-cyan-700"}`}
                                >
                                    {copied ? (
                                        <Check size={17} />
                                    ) : (
                                        <Copy size={17} />
                                    )}
                                    {copied ? "Copiado" : "Copiar Markdown"}
                                </button>
                            </div>
                            <article className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_8px_35px_rgba(15,23,42,0.05)]">
                                <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-5 py-3 text-xs font-medium text-slate-500">
                                    <span className="h-2 w-2 rounded-full bg-cyan-500" />{" "}
                                    Vista de contenido original
                                </div>
                                <pre className="max-h-[calc(100vh-260px)] overflow-auto whitespace-pre-wrap break-words p-5 font-mono text-[13px] leading-6 text-slate-700 sm:p-8">
                                    {selectedDocument.content}
                                </pre>
                            </article>
                        </>
                    ) : (
                        <div className="py-20 text-center text-slate-500">
                            No hay documentos Markdown para mostrar.
                        </div>
                    )}
                </main>
            </div>
            <Toaster
                position="top-center"
                richColors
                duration={2000}
                closeButton
            />
        </div>
    );
};

export default function App() {
    const markdownFiles = import.meta.glob<string>(
        "./sq-regulatorios-contabilidad/*.md",
        {
            query: "?raw",
            import: "default",
            eager: true,
        },
    );
    const documents = Object.entries(markdownFiles)
        .map(([path, content]) => ({
            name: path.split("/").pop() || path,
            content,
        }))
        .sort((first, second) => first.name.localeCompare(second.name));

    return <DocumentHub documents={documents} />;
}

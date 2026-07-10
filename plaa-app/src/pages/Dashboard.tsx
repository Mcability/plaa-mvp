import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { api } from "@appdeploy/client";
import type { DocType, Project } from "../types";
import { ProjectCard } from "../components/ProjectCard";
import { NewProjectModal } from "../components/NewProjectModal";

export function Dashboard({ onOpenProject }: { onOpenProject: (id: string) => void }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/projects");
      setProjects(res.data.projects);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (data: { name: string; docType: DocType; trimSize: string; brandPrimary?: string; brandSecondary?: string }) => {
    const res = await api.post("/api/projects", data);
    setShowModal(false);
    onOpenProject(res.data.project.id);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this project? This cannot be undone.")) return;
    setProjects((prev) => prev.filter((p) => p.id !== id));
    await api.delete(`/api/projects/${id}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl text-ink">Your Projects</h1>
          <p className="text-gray-500 text-sm mt-1">Hymnals, newsletters, and magazines in progress.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 bg-navy hover:bg-navy-dark text-white font-medium px-4 py-2.5 rounded-md transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">Loading projects…</p>
      ) : projects.length === 0 ? (
        <div className="border-2 border-dashed border-navy/15 rounded-xl p-16 text-center">
          <p className="text-gray-500 mb-4">No projects yet. Create your first one to get started.</p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-gold hover:bg-gold-light text-navy-dark font-semibold px-5 py-2.5 rounded-md transition-colors text-sm"
          >
            + New Project
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} onOpen={() => onOpenProject(p.id)} onDelete={() => handleDelete(p.id)} />
          ))}
        </div>
      )}

      {showModal && <NewProjectModal onClose={() => setShowModal(false)} onCreate={handleCreate} />}
    </div>
  );
}

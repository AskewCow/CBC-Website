import { getPublishedProjects } from "@/lib/queries";
import ProjectsClient from "./ProjectsClient";

export const revalidate = 300;

export default async function ProjectsPage() {
  const projects = await getPublishedProjects();
  return <ProjectsClient projects={projects} />;
}

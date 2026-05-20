window.API_BASE_URL =
  "https://santi-culinary-creator.vercel.app";

window.fetchProjects = async function(){
  const response =
    await fetch(`${API_BASE_URL}/api/projects`);

  if(!response.ok){
    throw new Error(
      "No se pudieron cargar los proyectos desde Mongo"
    );
  }

  return response.json();
};
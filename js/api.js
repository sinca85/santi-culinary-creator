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

window.updateProjectTasks = async function(id,tasks){
  const response =
    await fetch(`${API_BASE_URL}/api/projects`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        id,
        tasks
      })
    });

  if(!response.ok){
    const errorData =
      await response.json().catch(() => ({}));

    throw new Error(
      errorData.error ||
      "No se pudieron guardar las tareas"
    );
  }

  return response.json();
};

window.createProject = async function(project){
  const response =
    await fetch(`${API_BASE_URL}/api/projects`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(project)
    });

  if(!response.ok){
    const errorData =
      await response.json().catch(() => ({}));

    throw new Error(
      errorData.error ||
      "No se pudo guardar el proyecto"
    );
  }

  return response.json();
};

window.updateProject = async function(id,updates){
  const response =
    await fetch(`${API_BASE_URL}/api/projects`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        id,
        updates
      })
    });

  if(!response.ok){
    const errorData =
      await response.json().catch(() => ({}));

    throw new Error(
      errorData.error ||
      "No se pudo actualizar el proyecto"
    );
  }

  return response.json();
};
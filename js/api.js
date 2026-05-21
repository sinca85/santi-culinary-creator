window.API_BASE_URL =
  "https://santi-culinary-creator.vercel.app";

window.fetchProjects =
async function(){

  const response =
    await fetch(
      `${API_BASE_URL}/api/projects`,
      {
        credentials:"include"
      }
    );

  if(!response.ok){
    throw new Error(
      "No se pudieron cargar los proyectos"
    );
  }

  return response.json();
};



window.updateProjectTasks =
async function(id,tasks){

  const response =
    await fetch(
      `${API_BASE_URL}/api/projects`,
      {
        method:"PATCH",

        credentials:"include",

        headers:{
          "Content-Type":
          "application/json"
        },

        body:JSON.stringify({
          id,
          tasks
        })
      }
    );

  if(!response.ok){

    const error =
      await response
      .json()
      .catch(()=>({}));

    throw new Error(
      error.error ||
      "No se pudo guardar"
    );
  }

  return response.json();
};



window.createProject =
async function(project){

  const response =
    await fetch(
      `${API_BASE_URL}/api/projects`,
      {
        method:"POST",

        credentials:"include",

        headers:{
          "Content-Type":
          "application/json"
        },

        body:
        JSON.stringify(project)
      }
    );

  if(!response.ok){

    const error =
      await response
      .json()
      .catch(()=>({}));

    throw new Error(
      error.error ||
      "No se pudo crear"
    );
  }

  return response.json();
};



window.updateProject =
async function(id,updates){

  const response =
    await fetch(
      `${API_BASE_URL}/api/projects`,
      {
        method:"PATCH",

        credentials:"include",

        headers:{
          "Content-Type":
          "application/json"
        },

        body:JSON.stringify({
          id,
          updates
        })
      }
    );

  if(!response.ok){

    const error =
      await response
      .json()
      .catch(()=>({}));

    throw new Error(
      error.error ||
      "No se pudo actualizar"
    );
  }

  return response.json();
};



/* LOGIN */

window.loginAdmin =
async function(
  username,
  password
){

  const response =
    await fetch(
      `${API_BASE_URL}/api/login`,
      {

        method:"POST",

        credentials:"include",

        headers:{
          "Content-Type":
          "application/json"
        },

        body:
        JSON.stringify({
          username,
          password
        })

      }
    );

  if(!response.ok){

    const error =
      await response
      .json()
      .catch(()=>({}));

    throw new Error(
      error.error ||
      "Login inválido"
    );
  }

  return response.json();
};



window.logoutAdmin =
async function(){

  await fetch(
    `${API_BASE_URL}/api/logout`,
    {
      method:"POST",
      credentials:"include"
    }
  );

};



window.checkSession =
async function(){

  const response =
    await fetch(
      `${API_BASE_URL}/api/session`,
      {
        credentials:"include"
      }
    );

  return response.json();

};
window.buildFilterOptions = function(labels) {
  return [
    { value: "", label: "Todos" },
    ...Object.entries(labels).map(
      ([value,label]) => ({
        value,
        label
      })
    )
  ];
};

window.normalizeText = function(value){
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    );
};

window.slugify = function(value){
  return normalizeText(value)
    .replace(/[^a-z0-9]+/g,"-")
    .replace(/(^-|-$)/g,"");
};

window.getProjectId =
function(project){
  return (
    project.id ||
    project._id
  );
};

window.normalizeProject =
function(project){

  return {
    ...project,
    id:
      project.id ||
      project._id
  };

};

window.countPendingTasks =
function(projects,type){

  return projects.reduce(
    (total,project)=>

      total +

      (project.tasks || [])
        .filter(
          task =>
            !task.done &&
            (
              !type ||
              task.type === type
            )
        )
        .length,

    0
  );

};
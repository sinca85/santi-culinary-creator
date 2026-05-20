window.buildProjectFromForm = function(values) {
  const title =
    values.title || "Nuevo proyecto";

  const rawTasks =
    (values.tasks || "")
      .split("\n")
      .map(item => item.trim())
      .filter(Boolean);

  const tasks =
    rawTasks.map(text => {
      const clean =
        text
          .replace(/^- \[ \]\s*/i,"")
          .replace(/^-\s*/,"");

      const lower =
        normalizeText(clean);

      let type = "produccion";

      if(
        lower.includes("comprar") ||
        lower.includes("conseguir")
      ){
        type = "compra";
      }

      if(
        lower.includes("foto") ||
        lower.includes("reel") ||
        lower.includes("video") ||
        lower.includes("publicar")
      ){
        type = "contenido";
      }

      return {
        text: clean,
        done: false,
        type
      };
    });

  return {
    id: slugify(title),
    title,
    status: values.status || "idea",
    category: values.category || "general",
    priority: values.priority || "media",
    goal: values.goal || "",
    contentPending: Boolean(values.contentPending),
    dateTarget: "",
    coverImage: "",
    links: {
      youtube: "",
      instagram: "",
      tiktok: "",
      photos: ""
    },
    tasks,
    notes:
      (values.notes || "")
        .split("\n")
        .map(item => item.trim())
        .filter(Boolean),
    recipe: {
      ingredients: [],
      steps: [],
      result: "Sin probar"
    }
  };
};
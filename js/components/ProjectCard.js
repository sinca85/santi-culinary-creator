window.ProjectCard = function ProjectCard({
  project,
  onOpen,
  onToggleTask
}) {
  const {
    Button,
    Card,
    Checkbox,
    Tag
  } = antd;

  const pendingTasks =
    (project.tasks || [])
      .map((task,index)=>({
        task,
        index
      }))
      .filter(item => !item.task.done);

  const pendingPurchases =
    pendingTasks.filter(
      item => item.task.type === "compra"
    ).length;

  return (
    <Card
        className={`glass-card project-card ${
            project.coverImage ? "has-cover" : ""
        }`}

        style={
            project.coverImage
            ? {
                backgroundImage:
                    `linear-gradient(
                    rgba(0,0,0,.65),
                    rgba(0,0,0,.85)
                    ),
                    url(${project.coverImage})`,

                backgroundSize: "cover",
                backgroundPosition: "center"
                }
            : {}
        }

        title={project.title}

        extra={
            <Button
            size="small"
            onClick={() => onOpen(project)}
            >
            Abrir
            </Button>
        }
        >
      <p className="project-goal">
        {project.goal}
      </p>

      <div className="meta-row">
        <Tag
        className="tag-status"
        color={statusColor[project.status] || "default"}
        >
        {STATUS_LABELS[project.status] || project.status}
        </Tag>

        <Tag className="tag-category">
        {CATEGORY_LABELS[project.category] || project.category}
        </Tag>

        <Tag
        className="tag-priority"
        color={priorityColor[project.priority] || "default"}
        >
        Prioridad {PRIORITY_LABELS[project.priority] || project.priority}
        </Tag>

        {project.contentPending && (
        <Tag className="tag-content" color="magenta">
            Contenido redes
        </Tag>
        )}

        {pendingPurchases > 0 && (
        <Tag className="tag-purchases" color="volcano">
            {pendingPurchases} compras
        </Tag>
        )}
      </div>

      <ul className="task-list">
        {pendingTasks
          .slice(0,4)
          .map(({ task,index })=>(
            <li key={index}>
              <Checkbox
                checked={task.done}
                onChange={() =>
                  onToggleTask(
                    getProjectId(project),
                    index
                  )
                }
              />
              <span>{task.text}</span>
            </li>
          ))}
      </ul>
    </Card>
  );
};
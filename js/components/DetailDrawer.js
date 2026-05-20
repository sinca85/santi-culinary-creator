window.DetailDrawer = function DetailDrawer({
  project,
  onClose,
  onToggleTask
}) {
  const {
    Button,
    Checkbox,
    Drawer,
    Space,
    Tag,
    message
  } = antd;

  const {
    CopyOutlined
  } = icons;

  if(!project) return null;

  const jsonSnippet =
    JSON.stringify(project,null,2);

  return (
    <Drawer
      className="detail-drawer"
      title={project.title}
      open={Boolean(project)}
      onClose={onClose}
      width={620}
      extra={
        <Button
          icon={<CopyOutlined />}
          onClick={() => {
            navigator.clipboard.writeText(jsonSnippet);
            message.success("JSON copiado");
          }}
        >
          Copiar JSON
        </Button>
      }
    >
      <Space wrap>
        <Tag color={statusColor[project.status] || "default"}>
          {STATUS_LABELS[project.status] || project.status}
        </Tag>

        <Tag>
          {CATEGORY_LABELS[project.category] || project.category}
        </Tag>

        <Tag color={priorityColor[project.priority] || "default"}>
          Prioridad {PRIORITY_LABELS[project.priority] || project.priority}
        </Tag>
      </Space>

      <div className="detail-block">
        <h3>Objetivo</h3>
        <p>
          {project.goal || "Sin objetivo cargado."}
        </p>
      </div>

      <div className="detail-block">
        <h3>Tareas</h3>

        <ul className="task-list">
          {(project.tasks || []).map((task,index)=>(
            <li
              key={index}
              className={task.done ? "done" : ""}
            >
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
              <Tag>
                {TASK_TYPE_LABELS[task.type] || task.type}
              </Tag>
            </li>
          ))}
        </ul>
      </div>

      <div className="detail-block">
        <h3>Notas</h3>

        {(project.notes || []).length ? (
          <ul>
            {project.notes.map((note,index)=>(
              <li key={index}>{note}</li>
            ))}
          </ul>
        ) : (
          <p>Sin notas.</p>
        )}
      </div>

      <div className="detail-block">
        <h3>Links</h3>

        <Space direction="vertical">
          {Object
            .entries(project.links || {})
            .map(([key,value]) =>
              value ? (
                <a
                  key={key}
                  href={value}
                  target="_blank"
                  rel="noreferrer"
                >
                  {key}
                </a>
              ) : null
            )}

          {!Object
            .values(project.links || {})
            .some(Boolean) && (
              <p>Sin links cargados.</p>
            )}
        </Space>
      </div>

      <div className="detail-block">
        <h3>JSON para editar</h3>
        <pre className="code-block">
          {jsonSnippet}
        </pre>
      </div>
    </Drawer>
  );
};
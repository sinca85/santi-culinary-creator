window.DetailDrawer = function DetailDrawer({
  project,
  onClose,
  onToggleTask,
  onProjectUpdated
}) {
  const {
    Button,
    Checkbox,
    Drawer,
    Input,
    Space,
    Tag,
    message
  } = antd;

  const {
    CopyOutlined
  } = icons;

  const {
    useEffect,
    useState
  } = React;

  const [editing,setEditing] =
    useState(false);

  const [jsonText,setJsonText] =
    useState("");

  const [saving,setSaving] =
    useState(false);

  useEffect(() => {
    if(project){
      setJsonText(
        JSON.stringify(project,null,2)
      );
      setEditing(false);
    }
  },[
    project ? getProjectId(project) : null
  ]);

  if(!project) return null;

  const jsonSnippet =
    JSON.stringify(project,null,2);

  async function saveJsonChanges(){

    try {

      setSaving(true);

      const parsed =
        JSON.parse(jsonText);

      const projectId =
        getProjectId(project);

      const result =
        await updateProject(
          projectId,
          parsed
        );

      message.success(
        "Proyecto actualizado"
      );

      if(onProjectUpdated){
        onProjectUpdated(
          result.project
        );
      }

      setEditing(false);

    } catch(err){

      console.error(err);

      message.error(
        err.message ||
        "No se pudo guardar el JSON"
      );

    } finally {

      setSaving(false);

    }

  }

  return (
    <Drawer
      className="detail-drawer"
      title={project.title}
      open={Boolean(project)}
      onClose={onClose}
      width={720}
      extra={
        <Space>
          <Button
            onClick={() =>
              setEditing(!editing)
            }
          >
            {editing ? "Cancelar edición" : "Editar JSON"}
          </Button>

          <Button
            icon={<CopyOutlined />}
            onClick={() => {
              navigator.clipboard.writeText(jsonSnippet);
              message.success("JSON copiado");
            }}
          >
            Copiar JSON
          </Button>
        </Space>
      }
    >
      {!editing ? (
        <>
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
        </>
      ) : (
        <div className="detail-block">
          <h3>Editar proyecto como JSON</h3>

          <p style={{ color:"var(--muted)" }}>
            Editá cualquier campo del proyecto. No cambies <strong>id</strong>. Las tareas se pueden modificar como array JSON.
          </p>

          <Input.TextArea
            rows={28}
            value={jsonText}
            onChange={event =>
              setJsonText(event.target.value)
            }
          />

          <Space style={{ marginTop:12 }}>
            <Button
              type="primary"
              loading={saving}
              onClick={saveJsonChanges}
            >
              Guardar cambios
            </Button>

            <Button
              onClick={() => {
                setJsonText(jsonSnippet);
                setEditing(false);
              }}
            >
              Cancelar
            </Button>
          </Space>
        </div>
      )}
    </Drawer>
  );
};
window.DetailDrawer = function DetailDrawer({
  project,
  onClose,
  onToggleTask,
  onProjectUpdated,
  onProjectDeleted
}) {
  const {
    Button,
    Checkbox,
    Drawer,
    Input,
    Modal,
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

  const [deleting,setDeleting] =
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

  function confirmDelete(){

    Modal.confirm({
      title: "Eliminar elemento",
      content: `¿Seguro que querés eliminar "${project.title}"? Esta acción no se puede deshacer.`,
      okText: "Eliminar",
      cancelText: "Cancelar",
      okButtonProps: {
        danger: true
      },

      async onOk(){

        try {

          setDeleting(true);

          const projectId =
            getProjectId(project);

          await deleteProject(projectId);

          message.success(
            "Elemento eliminado"
          );

          if(onProjectDeleted){
            onProjectDeleted(projectId);
          }

          onClose();

        } catch(err){

          console.error(err);

          message.error(
            err.message ||
            "No se pudo eliminar"
          );

        } finally {

          setDeleting(false);

        }

      }
    });

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

          <Button
            danger
            loading={deleting}
            onClick={confirmDelete}
          >
            Eliminar
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

          {project.recipe &&
            (
              (project.recipe.ingredients || []).length ||
              (project.recipe.steps || []).length ||
              project.recipe.result
            ) && (
              <div className="detail-block">
                <h3>Receta</h3>

                {(project.recipe.ingredients || []).length > 0 && (
                  <>
                    <h4>Ingredientes</h4>
                    <ul>
                      {project.recipe.ingredients.map((ingredient,index)=>(
                        <li key={index}>{ingredient}</li>
                      ))}
                    </ul>
                  </>
                )}

                {(project.recipe.steps || []).length > 0 && (
                  <>
                    <h4>Pasos</h4>
                    <ol>
                      {project.recipe.steps.map((step,index)=>(
                        <li key={index}>{step}</li>
                      ))}
                    </ol>
                  </>
                )}

                {project.recipe.result && (
                  <p>
                    <strong>Resultado:</strong> {project.recipe.result}
                  </p>
                )}
              </div>
            )
          }

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
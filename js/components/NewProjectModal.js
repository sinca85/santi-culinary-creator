window.NewProjectModal = function NewProjectModal({
  open,
  onCancel,
  onProjectCreated
}) {
  const {
    Button,
    Checkbox,
    Col,
    Form,
    Input,
    Modal,
    Row,
    Select,
    Space,
    Tabs,
    message
  } = antd;

  const { useState } = React;

  const [form] = Form.useForm();
  const [jsonText,setJsonText] = useState("");
  const [saving,setSaving] = useState(false);

  async function saveProject(project){
    setSaving(true);

    try {
      const saved =
        await createProject(project);

      message.success("Proyecto guardado");

      if(onProjectCreated){
        onProjectCreated(saved.project);
      }

      form.resetFields();
      setJsonText("");

    } catch(err){
      console.error(err);
      message.error(
        err.message ||
        "No se pudo guardar el proyecto"
      );
    } finally {
      setSaving(false);
    }
  }

  async function saveManual(){
    const values =
      await form.validateFields();

    const project =
      buildProjectFromForm(values);

    await saveProject(project);
  }

  async function saveFromJson(){
    try {
      const project =
        JSON.parse(jsonText);

      if(!project.id && project.title){
        project.id = slugify(project.title);
      }

      await saveProject(project);

    } catch(err){
      message.error("JSON inválido");
    }
  }

  return (
    <Modal
      title="Guardar proyecto"
      open={open}
      onCancel={onCancel}
      footer={null}
      width={760}
    >
      <Tabs
        defaultActiveKey="manual"
        items={[
          {
            key: "manual",
            label: "Manual",
            children: (
              <>
                <Form
                  form={form}
                  layout="vertical"
                  initialValues={{
                    status: "idea",
                    category: "general",
                    priority: "media",
                    contentPending: true
                  }}
                >
                  <Row gutter={12}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="title"
                        label="Proyecto"
                        rules={[{ required:true }]}
                      >
                        <Input placeholder="Cheesecake frutos rojos" />
                      </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                      <Form.Item
                        name="goal"
                        label="Objetivo"
                      >
                        <Input placeholder="Receta repetible + fotos + reel" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={12}>
                    <Col xs={24} md={8}>
                      <Form.Item name="status" label="Estado">
                        <Select
                          options={Object.entries(STATUS_LABELS).map(([value,label]) => ({
                            value,
                            label
                          }))}
                        />
                      </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                      <Form.Item name="category" label="Categoría">
                        <Select
                          options={Object.entries(CATEGORY_LABELS).map(([value,label]) => ({
                            value,
                            label
                          }))}
                        />
                      </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                      <Form.Item name="priority" label="Prioridad">
                        <Select
                          options={Object.entries(PRIORITY_LABELS).map(([value,label]) => ({
                            value,
                            label
                          }))}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    name="contentPending"
                    valuePropName="checked"
                  >
                    <Checkbox>
                      Contenido redes pendiente
                    </Checkbox>
                  </Form.Item>

                  <Form.Item name="tasks" label="Checklist">
                    <Input.TextArea
                      rows={6}
                      placeholder={
                        "- [ ] Comprar queso crema\n- [ ] Comprar crema de leche\n- [ ] Sacar fotos\n- [ ] Grabar reel"
                      }
                    />
                  </Form.Item>

                  <Form.Item name="notes" label="Notas">
                    <Input.TextArea
                      rows={3}
                      placeholder={
                        "Probar versión económica\nEvaluar textura"
                      }
                    />
                  </Form.Item>

                  <Space>
                    <Button
                      type="primary"
                      loading={saving}
                      onClick={saveManual}
                    >
                      Guardar proyecto
                    </Button>

                    <Button onClick={() => form.resetFields()}>
                      Limpiar
                    </Button>
                  </Space>
                </Form>
              </>
            )
          },
          {
            key: "json",
            label: "Pegar JSON",
            children: (
              <>
                <p style={{ color:"var(--muted)" }}>
                  Pegá un proyecto completo en formato JSON. Si no tiene <strong>id</strong>, se genera desde el título.
                </p>

                <Input.TextArea
                  rows={14}
                  value={jsonText}
                  onChange={event =>
                    setJsonText(event.target.value)
                  }
                  placeholder={'{\n  "id": "bombones-pera",\n  "title": "Bombones de pera",\n  "status": "idea",\n  "category": "bombones",\n  "priority": "media",\n  "tasks": []\n}'}
                />

                <Space style={{ marginTop: 12 }}>
                  <Button
                    type="primary"
                    loading={saving}
                    onClick={saveFromJson}
                  >
                    Guardar proyecto
                  </Button>

                  <Button onClick={() => setJsonText("")}>
                    Limpiar
                  </Button>
                </Space>
              </>
            )
          }
        ]}
      />
    </Modal>
  );
};
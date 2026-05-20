window.NewProjectModal = function NewProjectModal({
  open,
  onCancel
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
    message
  } = antd;

  const {
    CopyOutlined
  } = icons;

  const {
    useState
  } = React;

  const [form] = Form.useForm();
  const [generated,setGenerated] =
    useState("");

  const onGenerate = async () => {
    const values =
      await form.validateFields();

    const project =
      buildProjectFromForm(values);

    setGenerated(
      JSON.stringify(project,null,2)
    );
  };

  return (
    <Modal
      title="Generador de proyecto"
      open={open}
      onCancel={onCancel}
      footer={null}
      width={760}
    >
      <p style={{ color:"var(--muted)" }}>
        Esto todavía no guarda en Mongo. Te genera el JSON para revisar/copiar.
      </p>

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
            <Form.Item
              name="status"
              label="Estado"
            >
              <Select
                options={
                  Object
                    .entries(STATUS_LABELS)
                    .map(([value,label])=>({
                      value,
                      label
                    }))
                }
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item
              name="category"
              label="Categoría"
            >
              <Select
                options={
                  Object
                    .entries(CATEGORY_LABELS)
                    .map(([value,label])=>({
                      value,
                      label
                    }))
                }
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item
              name="priority"
              label="Prioridad"
            >
              <Select
                options={
                  Object
                    .entries(PRIORITY_LABELS)
                    .map(([value,label])=>({
                      value,
                      label
                    }))
                }
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

        <Form.Item
          name="tasks"
          label="Checklist"
        >
          <Input.TextArea
            rows={6}
            placeholder={
              "- [ ] Comprar queso crema\n- [ ] Comprar crema de leche\n- [ ] Sacar fotos\n- [ ] Grabar reel"
            }
          />
        </Form.Item>

        <Form.Item
          name="notes"
          label="Notas"
        >
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
            onClick={onGenerate}
          >
            Generar JSON
          </Button>

          <Button
            onClick={() => form.resetFields()}
          >
            Limpiar
          </Button>
        </Space>
      </Form>

      {generated && (
        <div className="detail-block">
          <Space style={{ marginBottom:10 }}>
            <Button
              icon={<CopyOutlined />}
              onClick={() => {
                navigator.clipboard.writeText(generated);
                message.success("JSON copiado");
              }}
            >
              Copiar JSON
            </Button>
          </Space>

          <pre className="code-block">
            {generated}
          </pre>
        </div>
      )}
    </Modal>
  );
};

const {
  App,
  Button,
  Card,
  Checkbox,
  Col,
  Drawer,
  Empty,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Statistic,
  Tag,
  Tabs,
  Typography,
  message
} = antd;

const {
  PlusOutlined,
  GithubOutlined,
  LinkOutlined,
  CopyOutlined
} = icons;

const { useEffect, useMemo, useState } = React;

const STATUS_LABELS = {
  "idea": "Idea",
  "investigacion": "Investigación",
  "en-prueba": "En prueba",
  "produccion": "Producción",
  "aprobado": "Aprobado",
  "abandonado": "Abandonado"
};

const CATEGORY_LABELS = {
  "bombones": "Bombones",
  "tartas": "Tartas",
  "mousses": "Mousses",
  "chocolateria": "Chocolatería",
  "general": "General"
};

const PRIORITY_LABELS = {
  "alta": "Alta",
  "media": "Media",
  "baja": "Baja"
};
function buildFilterOptions(labels) {
  return [
    { value: "", label: "Todos" },
    ...Object.entries(labels).map(([value, label]) => ({ value, label }))
  ];
}
const TASK_TYPE_LABELS = {
  "compra": "Compra",
  "produccion": "Producción",
  "contenido": "Contenido"
};

const priorityColor = {
  alta: "red",
  media: "gold",
  baja: "green"
};

const statusColor = {
  idea: "blue",
  investigacion: "purple",
  "en-prueba": "orange",
  produccion: "cyan",
  aprobado: "green",
  abandonado: "default"
};

function normalizeText(value) {
  return String(value || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function slugify(value) {
  return normalizeText(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function countPendingTasks(projects, type) {
  return projects.reduce((total, project) => {
    return total + (project.tasks || []).filter(task => !task.done && (!type || task.type === type)).length;
  }, 0);
}

function buildProjectFromForm(values) {
  const title = values.title || "Nuevo proyecto";
  const rawTasks = (values.tasks || "")
    .split("\n")
    .map(item => item.trim())
    .filter(Boolean);

  const tasks = rawTasks.map(text => {
    const clean = text.replace(/^- \[ \]\s*/i, "").replace(/^-\s*/, "");
    const lower = normalizeText(clean);
    let type = "produccion";
    if (lower.includes("comprar") || lower.includes("conseguir")) type = "compra";
    if (lower.includes("foto") || lower.includes("reel") || lower.includes("video") || lower.includes("publicar")) type = "contenido";
    return { text: clean, done: false, type };
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
    notes: (values.notes || "").split("\n").map(item => item.trim()).filter(Boolean),
    recipe: {
      ingredients: [],
      steps: [],
      result: "Sin probar"
    }
  };
}

function ProjectCard({ project, onOpen }) {
  const pendingTasks = (project.tasks || []).filter(task => !task.done);
  const pendingPurchases = pendingTasks.filter(task => task.type === "compra").length;

  return (
    <Card
      className="glass-card project-card"
      title={project.title}
      extra={<Button size="small" onClick={() => onOpen(project)}>Abrir</Button>}
    >
      <p className="project-goal">{project.goal}</p>

      <div className="meta-row">
        <Tag color={statusColor[project.status] || "default"}>{STATUS_LABELS[project.status] || project.status}</Tag>
        <Tag>{CATEGORY_LABELS[project.category] || project.category}</Tag>
        <Tag color={priorityColor[project.priority] || "default"}>Prioridad {PRIORITY_LABELS[project.priority] || project.priority}</Tag>
        {project.contentPending && <Tag color="magenta">Contenido redes</Tag>}
        {pendingPurchases > 0 && <Tag color="volcano">{pendingPurchases} compras</Tag>}
      </div>

      <ul className="task-list">
        {pendingTasks.slice(0, 4).map((task, index) => (
          <li key={index}>
            <Checkbox checked={task.done} />
            <span>{task.text}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function DetailDrawer({ project, onClose }) {
  if (!project) return null;

  const jsonSnippet = JSON.stringify(project, null, 2);

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
        <Tag color={statusColor[project.status] || "default"}>{STATUS_LABELS[project.status] || project.status}</Tag>
        <Tag>{CATEGORY_LABELS[project.category] || project.category}</Tag>
        <Tag color={priorityColor[project.priority] || "default"}>Prioridad {PRIORITY_LABELS[project.priority] || project.priority}</Tag>
      </Space>

      <div className="detail-block">
        <h3>Objetivo</h3>
        <p>{project.goal || "Sin objetivo cargado."}</p>
      </div>

      <div className="detail-block">
        <h3>Tareas</h3>
        <ul className="task-list">
          {(project.tasks || []).map((task, index) => (
            <li key={index} className={task.done ? "done" : ""}>
              <Checkbox checked={task.done} />
              <span>{task.text}</span>
              <Tag>{TASK_TYPE_LABELS[task.type] || task.type}</Tag>
            </li>
          ))}
        </ul>
      </div>

      <div className="detail-block">
        <h3>Notas</h3>
        {(project.notes || []).length ? (
          <ul>
            {project.notes.map((note, index) => <li key={index}>{note}</li>)}
          </ul>
        ) : (
          <p>Sin notas.</p>
        )}
      </div>

      <div className="detail-block">
        <h3>Links</h3>
        <Space direction="vertical">
          {Object.entries(project.links || {}).map(([key, value]) => (
            value ? <a key={key} href={value} target="_blank" rel="noreferrer">{key}</a> : null
          ))}
          {!Object.values(project.links || {}).some(Boolean) && <p>Sin links cargados.</p>}
        </Space>
      </div>

      <div className="detail-block">
        <h3>JSON para editar</h3>
        <pre className="code-block">{jsonSnippet}</pre>
      </div>
    </Drawer>
  );
}

function NewProjectModal({ open, onCancel }) {
  const [form] = Form.useForm();
  const [generated, setGenerated] = useState("");

  const onGenerate = async () => {
    const values = await form.validateFields();
    const project = buildProjectFromForm(values);
    setGenerated(JSON.stringify(project, null, 2));
  };

  return (
    <Modal
      title="Generador de proyecto"
      open={open}
      onCancel={onCancel}
      footer={null}
      width={760}
    >
      <p style={{ color: "var(--muted)" }}>
        Esto no escribe solo en GitHub todavía. Te genera el bloque JSON para pegarlo en <strong>data/projects.json</strong>.
      </p>

      <Form form={form} layout="vertical" initialValues={{
        status: "idea",
        category: "general",
        priority: "media",
        contentPending: true
      }}>
        <Row gutter={12}>
          <Col xs={24} md={12}>
            <Form.Item name="title" label="Proyecto" rules={[{ required: true }]}>
              <Input placeholder="Cheesecake frutos rojos" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="goal" label="Objetivo">
              <Input placeholder="Receta repetible + fotos + reel" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          <Col xs={24} md={8}>
            <Form.Item name="status" label="Estado">
              <Select options={Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label }))} />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="category" label="Categoría">
              <Select options={Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label }))} />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="priority" label="Prioridad">
              <Select options={Object.entries(PRIORITY_LABELS).map(([value, label]) => ({ value, label }))} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="contentPending" valuePropName="checked">
          <Checkbox>Contenido redes pendiente</Checkbox>
        </Form.Item>

        <Form.Item name="tasks" label="Checklist">
          <Input.TextArea rows={6} placeholder={"- [ ] Comprar queso crema\n- [ ] Comprar crema de leche\n- [ ] Sacar fotos\n- [ ] Grabar reel"} />
        </Form.Item>

        <Form.Item name="notes" label="Notas">
          <Input.TextArea rows={3} placeholder={"Probar versión económica\nEvaluar textura"} />
        </Form.Item>

        <Space>
          <Button type="primary" onClick={onGenerate}>Generar JSON</Button>
          <Button onClick={() => form.resetFields()}>Limpiar</Button>
        </Space>
      </Form>

      {generated && (
        <div className="detail-block">
          <Space style={{ marginBottom: 10 }}>
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
          <pre className="code-block">{generated}</pre>
        </div>
      )}
    </Modal>
  );
}

function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [config, setConfig] = useState({});
  const [selectedProject, setSelectedProject] = useState(null);
  const [generatorOpen, setGeneratorOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    category: "",
    priority: "",
    contentOnly: false
  });

  useEffect(() => {
    Promise.all([
      fetch("./data/projects.json").then(response => response.json()),
      fetch("./data/config.json").then(response => response.json())
    ]).then(([projectsData, configData]) => {
      setProjects(projectsData);
      setConfig(configData);
    });
  }, []);

  const filteredProjects = useMemo(() => {
    const search = normalizeText(filters.search);

    return projects.filter(project => {
      const searchable = normalizeText([
        project.title,
        project.goal,
        project.category,
        project.status,
        ...(project.notes || []),
        ...(project.tasks || []).map(task => task.text)
      ].join(" "));

      if (search && !searchable.includes(search)) return false;
      if (filters.status && project.status !== filters.status) return false;
      if (filters.category && project.category !== filters.category) return false;
      if (filters.priority && project.priority !== filters.priority) return false;
      if (filters.contentOnly && !project.contentPending) return false;

      return true;
    });
  }, [projects, filters]);

  const highPriority = projects.filter(project => project.priority === "alta").length;
  const pendingPurchases = countPendingTasks(projects, "compra");
  const pendingContent = projects.filter(project => project.contentPending).length;

  const purchaseProjects = projects.filter(project =>
    (project.tasks || []).some(task => task.type === "compra" && !task.done)
  );

  const contentProjects = projects.filter(project => project.contentPending);

  return (
    <App>
      <div className="app-shell">
        <header className="app-header">
          <div>
            <p className="eyebrow">Culinary dashboard</p>
            <h1 className="app-title">{config.siteTitle || "Santi Villa Abrille - Culinary Creator"}</h1>
            <p className="app-subtitle">{config.subtitle || "Dashboard personal de proyectos gastronómicos."}</p>
          </div>

          <div className="header-actions">
            <Button icon={<PlusOutlined />} type="primary" onClick={() => setGeneratorOpen(true)}>
              Generar proyecto
            </Button>
            <Button icon={<LinkOutlined />} href="./data/projects.json" target="_blank">
              Ver JSON
            </Button>
            <Button icon={<GithubOutlined />} href="https://github.com/" target="_blank">
              GitHub
            </Button>
          </div>
        </header>

        <Row gutter={[16, 16]}>
          <Col xs={12} md={6}>
            <Card className="glass-card summary-card">
              <Statistic title="Proyectos" value={projects.length} />
            </Card>
          </Col>
          <Col xs={12} md={6}>
            <Card className="glass-card summary-card">
              <Statistic title="Prioridad alta" value={highPriority} />
            </Card>
          </Col>
          <Col xs={12} md={6}>
            <Card className="glass-card summary-card">
              <Statistic title="Compras pendientes" value={pendingPurchases} />
            </Card>
          </Col>
          <Col xs={12} md={6}>
            <Card className="glass-card summary-card">
              <Statistic title="Contenido redes" value={pendingContent} />
            </Card>
          </Col>
        </Row>

        <Card className="glass-card controls-card">
          <Row gutter={[12, 12]} align="middle">
            <Col xs={24} md={8}>
              <Input.Search
                placeholder="Buscar proyecto, tarea o nota..."
                value={filters.search}
                onChange={event => setFilters({ ...filters, search: event.target.value })}
                allowClear
              />
            </Col>
            <Col xs={24} sm={8} md={4}>
              <Select
                placeholder="Estado"
                value={filters.status || undefined}
                onChange={value => setFilters({ ...filters, status: value || "" })}
                allowClear
                style={{ width: "100%" }}
                options={buildFilterOptions(STATUS_LABELS).map(([value, label]) => ({ value, label }))}
              />
            </Col>
            <Col xs={24} sm={8} md={4}>
              <Select
                placeholder="Categoría"
                value={filters.category || undefined}
                onChange={value => setFilters({ ...filters, category: value || "" })}
                allowClear
                style={{ width: "100%" }}
                options={buildFilterOptions(CATEGORY_LABELS).map(([value, label]) => ({ value, label }))}
              />
            </Col>
            <Col xs={24} sm={8} md={4}>
              <Select
                placeholder="Prioridad"
                value={filters.priority || undefined}
                onChange={value => setFilters({ ...filters, priority: value || "" })}
                allowClear
                style={{ width: "100%" }}
                options={buildFilterOptions(PRIORITY_LABELS).map(([value, label]) => ({ value, label }))}
              />
            </Col>
            <Col xs={24} md={4}>
              <Checkbox
                checked={filters.contentOnly}
                onChange={event => setFilters({ ...filters, contentOnly: event.target.checked })}
              >
                Contenido redes
              </Checkbox>
            </Col>
          </Row>
        </Card>

        <Tabs
          defaultActiveKey="todos"
          items={[
            {
              key: "todos",
              label: "Todos",
              children: (
                filteredProjects.length ? (
                  <Row gutter={[16, 16]}>
                    {filteredProjects.map(project => (
                      <Col xs={24} md={12} xl={8} key={project.id}>
                        <ProjectCard project={project} onOpen={setSelectedProject} />
                      </Col>
                    ))}
                  </Row>
                ) : <Empty description="No hay proyectos con estos filtros." />
              )
            },
            {
              key: "compras",
              label: "Compras pendientes",
              children: (
                purchaseProjects.length ? (
                  <Row gutter={[16, 16]}>
                    {purchaseProjects.map(project => (
                      <Col xs={24} md={12} xl={8} key={project.id}>
                        <ProjectCard project={project} onOpen={setSelectedProject} />
                      </Col>
                    ))}
                  </Row>
                ) : <Empty description="No hay compras pendientes." />
              )
            },
            {
              key: "contenido",
              label: "Contenido redes",
              children: (
                contentProjects.length ? (
                  <Row gutter={[16, 16]}>
                    {contentProjects.map(project => (
                      <Col xs={24} md={12} xl={8} key={project.id}>
                        <ProjectCard project={project} onOpen={setSelectedProject} />
                      </Col>
                    ))}
                  </Row>
                ) : <Empty description="No hay contenido pendiente." />
              )
            }
          ]}
        />

        <DetailDrawer project={selectedProject} onClose={() => setSelectedProject(null)} />
        <NewProjectModal open={generatorOpen} onCancel={() => setGeneratorOpen(false)} />
      </div>
    </App>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<Dashboard />);

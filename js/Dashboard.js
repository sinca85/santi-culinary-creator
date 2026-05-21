window.Dashboard = function Dashboard() {
  const {
    App,
    Button,
    Card,
    Checkbox,
    Col,
    Empty,
    Input,
    Row,
    Select,
    Statistic,
    Tabs,
    message
  } = antd;

  const {
    PlusOutlined,
    GithubOutlined,
    LinkOutlined
  } = icons;

  const {
    useEffect,
    useMemo,
    useState
  } = React;

  const [projects,setProjects] =
    useState([]);

  const [config,setConfig] =
    useState({});

  const [selectedProjectId,setSelectedProjectId] =
    useState(null);

  const [generatorOpen,setGeneratorOpen] =
    useState(false);

  const [loadingProjects,setLoadingProjects] =
    useState(true);

  const [filters,setFilters] =
    useState({
      search: "",
      status: "",
      category: "",
      priority: "",
      contentOnly: false
    });

  useEffect(() => {

    async function loadProjects(){

      try {

        setLoadingProjects(true);

        const [
          projectsData,
          configData
        ] = await Promise.all([
          fetchProjects(),
          fetch("./data/config.json")
            .then(r => r.json())
        ]);

        setProjects(
          (projectsData || [])
            .map(normalizeProject)
        );

        setConfig(configData);

      } catch(err){

        console.error(err);

        message.error(
          err.message ||
          "Error al cargar proyectos"
        );

      } finally {

        setLoadingProjects(false);

      }

    }

    loadProjects();

  },[]);

  const selectedProject =
    useMemo(() => {

      return (
        projects.find(
          project =>
            getProjectId(project) === selectedProjectId
        ) ||
        null
      );

    },[
      projects,
      selectedProjectId
    ]);

  async function toggleTask(projectId,taskIndex){

    const currentProject =
      projects.find(
        project =>
          getProjectId(project) === projectId
      );

    if(!currentProject) return;

    const updatedTasks =
      (currentProject.tasks || [])
        .map((task,index) =>
          index === taskIndex
            ? {
                ...task,
                done: !task.done
              }
            : task
        );

    setProjects(prev =>
      prev.map(project => {

        if(getProjectId(project) !== projectId){
          return project;
        }

        return {
          ...project,
          tasks: updatedTasks
        };

      })
    );

    try {

      await updateProjectTasks(
        projectId,
        updatedTasks
      );

      message.success("Tarea actualizada");

    } catch(err){

      console.error(err);

      message.error(
        err.message ||
        "No se pudo guardar la tarea"
      );

      setProjects(prev =>
        prev.map(project => {

          if(getProjectId(project) !== projectId){
            return project;
          }

          return currentProject;

        })
      );

    }

  }

  function isPublished(project){

    const published =
      project.published || {};

    return Object.values(published)
      .some(item =>
        item &&
        item.published === true
      );

  }

  function renderProjectsList(projectList,emptyText){

    return projectList.length ? (
      <Row gutter={[16,16]}>
        {projectList.map(project => (
          <Col
            xs={24}
            md={12}
            xl={8}
            key={getProjectId(project)}
          >
            <ProjectCard
              project={project}
              onOpen={project =>
                setSelectedProjectId(
                  getProjectId(project)
                )
              }
              onToggleTask={toggleTask}
            />
          </Col>
        ))}
      </Row>
    ) : (
      <Empty
        description={
          loadingProjects
            ? "Cargando proyectos..."
            : emptyText
        }
      />
    );

  }

  const filteredProjects =
    useMemo(() => {

      const search =
        normalizeText(filters.search);

      return projects.filter(project => {

        const searchable =
          normalizeText([
            project.title,
            project.goal,
            project.category,
            project.status,
            project.type,
            ...(project.notes || []),
            ...(project.tasks || [])
              .map(task => task.text),
            ...Object.values(project.published || {})
              .map(item => item?.url || "")
          ].join(" "));

        if(search && !searchable.includes(search)){
          return false;
        }

        if(filters.status && project.status !== filters.status){
          return false;
        }

        if(filters.category && project.category !== filters.category){
          return false;
        }

        if(filters.priority && project.priority !== filters.priority){
          return false;
        }

        if(filters.contentOnly && !project.contentPending){
          return false;
        }

        return true;

      });

    },[
      projects,
      filters
    ]);

  const baseProjects =
    filteredProjects.filter(
      project => project.type === "base"
    );

  const composedProjects =
    filteredProjects.filter(
      project =>
        project.type === "project" ||
        !project.type
    );

  const publishedProjects =
    filteredProjects.filter(
      project => isPublished(project)
    );

  const highPriority =
    projects.filter(
      project => project.priority === "alta"
    ).length;

  const pendingPurchases =
    countPendingTasks(projects,"compra");

  const pendingContent =
    projects.filter(
      project => project.contentPending
    ).length;

  return (
    <App>
      <div className="app-shell">
        <header className="app-header">
          <div>
            <p className="eyebrow">
              Culinary dashboard
            </p>

            <h1 className="app-title">
              {
                config.siteTitle ||
                "Santi Villa Abrille - Culinary Creator"
              }
            </h1>

            <p className="app-subtitle">
              {
                config.subtitle ||
                "Dashboard personal de proyectos gastronómicos."
              }
            </p>
          </div>

          <div className="header-actions">
            <Button
              icon={<PlusOutlined />}
              type="primary"
              onClick={() => setGeneratorOpen(true)}
            >
              Generar proyecto
            </Button>

            <Button
              icon={<LinkOutlined />}
              href={`${API_BASE_URL}/api/projects`}
              target="_blank"
            >
              Ver Mongo
            </Button>

            <Button
              icon={<GithubOutlined />}
              href="https://github.com/sinca85/santi-culinary-creator"
              target="_blank"
            >
              GitHub
            </Button>
          </div>
        </header>

        <Row gutter={[12,8]}>
          <Col xs={12} md={6}>
            <Card className="glass-card summary-card">
              <Statistic
                title="Proyectos"
                value={projects.length}
                loading={loadingProjects}
              />
            </Card>
          </Col>

          <Col xs={12} md={6}>
            <Card className="glass-card summary-card">
              <Statistic
                title="Prioridad alta"
                value={highPriority}
                loading={loadingProjects}
              />
            </Card>
          </Col>

          <Col xs={12} md={6}>
            <Card className="glass-card summary-card">
              <Statistic
                title="Compras pendientes"
                value={pendingPurchases}
                loading={loadingProjects}
              />
            </Card>
          </Col>

          <Col xs={12} md={6}>
            <Card className="glass-card summary-card">
              <Statistic
                title="Contenido redes"
                value={pendingContent}
                loading={loadingProjects}
              />
            </Card>
          </Col>
        </Row>

        <Card className="glass-card controls-card">
          <Row gutter={[12,12]} align="middle">
            <Col xs={24} md={8}>
              <Input.Search
                placeholder="Buscar proyecto, tarea o nota..."
                value={filters.search}
                onChange={event =>
                  setFilters({
                    ...filters,
                    search: event.target.value
                  })
                }
                allowClear
              />
            </Col>

            <Col xs={24} sm={8} md={4}>
              <Select
                placeholder="Estado"
                value={filters.status}
                onChange={value =>
                  setFilters({
                    ...filters,
                    status: value
                  })
                }
                style={{ width:"100%" }}
                options={buildFilterOptions(STATUS_LABELS)}
              />
            </Col>

            <Col xs={24} sm={8} md={4}>
              <Select
                placeholder="Categoría"
                value={filters.category}
                onChange={value =>
                  setFilters({
                    ...filters,
                    category: value
                  })
                }
                style={{ width:"100%" }}
                options={buildFilterOptions(CATEGORY_LABELS)}
              />
            </Col>

            <Col xs={24} sm={8} md={4}>
              <Select
                placeholder="Prioridad"
                value={filters.priority}
                onChange={value =>
                  setFilters({
                    ...filters,
                    priority: value
                  })
                }
                style={{ width:"100%" }}
                options={buildFilterOptions(PRIORITY_LABELS)}
              />
            </Col>

            <Col xs={24} md={4}>
              <Checkbox
                checked={filters.contentOnly}
                onChange={event =>
                  setFilters({
                    ...filters,
                    contentOnly: event.target.checked
                  })
                }
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
              children:
                renderProjectsList(
                  filteredProjects,
                  "No hay proyectos con estos filtros."
                )
            },
            {
              key: "bases",
              label: "Bases",
              children:
                renderProjectsList(
                  baseProjects,
                  "No hay bases cargadas."
                )
            },
            {
              key: "proyectos",
              label: "Proyectos",
              children:
                renderProjectsList(
                  composedProjects,
                  "No hay proyectos cargados."
                )
            },
            {
              key: "publicados",
              label: "Publicados",
              children:
                renderProjectsList(
                  publishedProjects,
                  "No hay contenidos publicados."
                )
            }
          ]}
        />

        <DetailDrawer
          project={selectedProject}
          onClose={() => setSelectedProjectId(null)}
          onToggleTask={toggleTask}
          onProjectUpdated={updatedProject => {
            setProjects(prev =>
              prev.map(project =>
                getProjectId(project) === getProjectId(updatedProject)
                  ? normalizeProject(updatedProject)
                  : project
              )
            );
          }}
        />

        <NewProjectModal
          open={generatorOpen}
          onCancel={() => setGeneratorOpen(false)}
          onProjectCreated={project => {
            setProjects(prev => [
              normalizeProject(project),
              ...prev
            ]);

            setGeneratorOpen(false);
          }}
        />
      </div>
    </App>
  );
};
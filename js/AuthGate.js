window.AuthGate = function AuthGate() {
  const {
    Button,
    Card,
    Form,
    Input,
    message
  } = antd;

  const {
    useEffect,
    useState
  } = React;

  const [checking, setChecking] =
    useState(true);

  const [authenticated, setAuthenticated] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  useEffect(() => {
    async function run() {
      try {

        const response =
          await checkSession();

        setAuthenticated(
          Boolean(response.authenticated)
        );

      } catch (err) {

        setAuthenticated(false);

      } finally {

        setChecking(false);

      }
    }

    run();

  }, []);

  async function onLogin(values) {
    try {

      setLoading(true);

      await loginAdmin(
        values.username,
        values.password
      );

      setAuthenticated(true);

      message.success(
        "Sesión iniciada"
      );

    } catch (err) {

      message.error(
        err.message ||
        "Error al iniciar sesión"
      );

    } finally {

      setLoading(false);

    }
  }

  async function onLogout() {

    await logoutAdmin();

    setAuthenticated(false);

    message.success(
      "Sesión cerrada"
    );
  }

  if (checking) {
    return (
      <div className="app-shell">
        <p>
          Verificando sesión...
        </p>
      </div>
    );
  }

  if (!authenticated) {

    return (
      <div className="login-shell">

        <Card
          className="
            glass-card
            login-card
          "
        >

          <p className="eyebrow">
            Dashboard privado
          </p>

          <h1 className="app-title">
            Santi Culinary Creator
          </h1>

          <p className="app-subtitle">
            Ingresá usuario y contraseña
          </p>

          <Form
            layout="vertical"
            onFinish={onLogin}
            style={{
              marginTop: 30
            }}
          >

            <Form.Item
              label="Usuario"
              name="username"
              rules={[
                {
                  required: true
                }
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Contraseña"
              name="password"
              rules={[
                {
                  required: true
                }
              ]}
            >
              <Input.Password />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
            >
              Entrar
            </Button>

          </Form>

        </Card>

      </div>
    );
  }

  return (
    <Dashboard
      onLogout={onLogout}
    />
  );
};
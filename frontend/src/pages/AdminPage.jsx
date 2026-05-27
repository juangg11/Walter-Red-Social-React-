import { useEffect, useMemo, useState } from "react";
import request from "../api/client";
import styles from "./AdminPage.module.css";

export default function AdminPage() {
  const [schema, setSchema] = useState(null);
  const [selectedPath, setSelectedPath] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [body, setBody] = useState("{}");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/swagger.json`);
        const data = await res.json();
        setSchema(data);
      } catch (e) {
        console.error("Swagger error:", e);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const routes = useMemo(() => {
    if (!schema?.paths) return [];

    return Object.entries(schema.paths).flatMap(([path, methods]) =>
      Object.entries(methods || {}).map(([method, info]) => ({
        path,
        method: method.toUpperCase(),
        summary: info.summary,
        description: info.description,
        requestBody: info.requestBody,
      }))
    );
  }, [schema]);

  async function execute(route) {
    try {
      let parsedBody = null;

      try {
        parsedBody = body ? JSON.parse(body) : null;
      } catch {
        alert("JSON inválido");
        return;
      }

      const res = await request(route.path, {
        method: route.method,
        body: parsedBody ? JSON.stringify(parsedBody) : undefined,
      });

      setResult(res);
    } catch (e) {
      setResult({ error: e.message });
    }
  }

  if (loading) return <div className={styles.loading}>Cargando API...</div>;
  if (!schema) return <div>No se pudo cargar Swagger</div>;

  return (
    <div className={styles.container}>
      {/* LEFT: TABLE */}
      <div className={styles.leftPanel}>
        <h2>🧩 API ADMIN PANEL</h2>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Método</th>
              <th>Ruta</th>
              <th>Descripción</th>
              <th>Acción</th>
            </tr>
          </thead>

          <tbody>
            {routes.map((r, i) => (
              <tr
                key={i}
                className={`${styles.row} ${selectedPath === r.path ? styles.active : ""}`}
              >
                <td>
                  <span className={`${styles.method} ${styles[r.method]}`}>
                    {r.method}
                  </span>
                </td>

                <td className={styles.path}>{r.path}</td>

                <td>{r.summary || "Sin descripción"}</td>

                <td>
                  <button
                    className={styles.runBtn}
                    onClick={() => {
                      setSelectedPath(r.path);
                      setSelectedMethod(r.method);
                      execute(r);
                    }}
                  >
                    Ejecutar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* RIGHT: EDITOR */}
      <div className={styles.rightPanel}>
        <h3>⚙️ Request Builder</h3>

        <div className={styles.box}>
          <div>
            <strong>Ruta:</strong> {selectedPath || "Ninguna"}
          </div>

          <div>
            <strong>Método:</strong> {selectedMethod || "—"}
          </div>

          <textarea
            className={styles.textarea}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder='{"example": "data"}'
          />

          <button
            className={styles.primaryBtn}
            disabled={!selectedPath}
            onClick={() =>
              execute({ path: selectedPath, method: selectedMethod })
            }
          >
            Ejecutar manual
          </button>
        </div>

        <h3>📦 Response</h3>

        <pre className={styles.response}>
          {result ? JSON.stringify(result, null, 2) : "Sin ejecución"}
        </pre>
      </div>
    </div>
  );
}
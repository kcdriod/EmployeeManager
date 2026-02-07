import React, { useEffect, useMemo, useState } from "react";
import { api } from "./api";
import EmployeeForm from "./EmployeeForm";
import EmployeeTable from "./EmployeeTable";
import "./App.css";

const SPARKLINE_WIDTH = 420;
const SPARKLINE_HEIGHT = 120;
const SPARKLINE_PADDING = 10;

function buildSparklinePath(values) {
  if (values.length === 0) {
    return "";
  }

  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = Math.max(max - min, 1);
  const stepX =
    values.length === 1
      ? 0
      : (SPARKLINE_WIDTH - SPARKLINE_PADDING * 2) / (values.length - 1);

  return values
    .map((value, index) => {
      const x = SPARKLINE_PADDING + index * stepX;
      const normalized = (value - min) / range;
      const y = SPARKLINE_HEIGHT - SPARKLINE_PADDING - normalized * (SPARKLINE_HEIGHT - SPARKLINE_PADDING * 2);
      return `${index === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
}

function getInitials(name) {
  if (!name) return "NA";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() || "").join("") || "NA";
}

export default function App() {
  const [employees, setEmployees] = useState([]);
  const [mode, setMode] = useState("create"); // create | edit
  const [selected, setSelected] = useState(null);
  const [serverErrors, setServerErrors] = useState(null);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [sortBy, setSortBy] = useState("name-asc");

  const loadEmployees = async () => {
    try {
      const res = await api.get("/employees");
      setEmployees(res.data);
    } catch (err) {
      setServerErrors(err?.response?.data || { error: "Unable to load employees right now." });
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const handleCreate = async (payload) => {
    try {
      setServerErrors(null);
      setLoading(true);
      await api.post("/employees", payload);
      await loadEmployees();
    } catch (err) {
      setServerErrors(err?.response?.data || { error: "Unknown error" });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (payload) => {
    try {
      setServerErrors(null);
      setLoading(true);
      await api.put(`/employees/${selected.id}`, payload);
      setMode("create");
      setSelected(null);
      await loadEmployees();
    } catch (err) {
      setServerErrors(err?.response?.data || { error: "Unknown error" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this employee record? This action cannot be undone.")) {
      return;
    }

    try {
      setServerErrors(null);
      setLoading(true);
      await api.delete(`/employees/${id}`);
      // If you were editing the same employee, cancel edit
      if (selected?.id === id) {
        setMode("create");
        setSelected(null);
      }
      await loadEmployees();
    } catch (err) {
      setServerErrors(err?.response?.data || { error: "Unknown error" });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (payload) => {
    if (mode === "edit") return handleUpdate(payload);
    return handleCreate(payload);
  };

  const departments = useMemo(() => {
    const unique = new Set(employees.map((employee) => employee.department).filter(Boolean));
    return ["All", ...Array.from(unique).sort((a, b) => a.localeCompare(b))];
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = employees.filter((employee) => {
      const matchesDepartment =
        departmentFilter === "All" || employee.department === departmentFilter;
      const matchesText =
        normalizedQuery.length === 0 ||
        `${employee.name} ${employee.email} ${employee.department}`
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesDepartment && matchesText;
    });

    const sorted = [...filtered];
    sorted.sort((a, b) => {
      if (sortBy === "name-asc") return a.name.localeCompare(b.name);
      if (sortBy === "name-desc") return b.name.localeCompare(a.name);
      if (sortBy === "salary-asc") return Number(a.salary) - Number(b.salary);
      if (sortBy === "salary-desc") return Number(b.salary) - Number(a.salary);
      return Number(b.id) - Number(a.id);
    });

    return sorted;
  }, [employees, query, departmentFilter, sortBy]);

  const totalPayroll = useMemo(
    () =>
      employees.reduce((sum, employee) => {
        return sum + Number(employee.salary || 0);
      }, 0),
    [employees]
  );

  const averageSalary = employees.length === 0 ? 0 : totalPayroll / employees.length;

  const departmentStats = useMemo(() => {
    const map = new Map();
    employees.forEach((employee) => {
      const key = employee.department || "Unassigned";
      const current = map.get(key) || { department: key, count: 0, payroll: 0 };
      current.count += 1;
      current.payroll += Number(employee.salary || 0);
      map.set(key, current);
    });

    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [employees]);

  const salarySeries = useMemo(() => {
    return [...employees]
      .sort((a, b) => Number(a.id) - Number(b.id))
      .slice(-12)
      .map((employee) => Number(employee.salary || 0));
  }, [employees]);

  const sparklinePath = useMemo(() => buildSparklinePath(salarySeries), [salarySeries]);

  const topEarners = useMemo(() => {
    return [...employees]
      .sort((a, b) => Number(b.salary || 0) - Number(a.salary || 0))
      .slice(0, 4);
  }, [employees]);

  const salaryBandData = useMemo(() => {
    const bands = [
      { label: "Foundation", key: "foundation", count: 0, color: "is-foundation" },
      { label: "Core", key: "core", count: 0, color: "is-core" },
      { label: "Premium", key: "premium", count: 0, color: "is-premium" },
    ];

    employees.forEach((employee) => {
      const salary = Number(employee.salary || 0);
      if (salary < 70000) {
        bands[0].count += 1;
      } else if (salary <= 120000) {
        bands[1].count += 1;
      } else {
        bands[2].count += 1;
      }
    });

    return bands.map((band) => ({
      ...band,
      percent: employees.length === 0 ? 0 : Math.round((band.count / employees.length) * 100),
    }));
  }, [employees]);

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <div className="app-shell">
      <div className="bg-orb bg-orb-one" />
      <div className="bg-orb bg-orb-two" />
      <div className="grid-overlay" />

      <main className="app-frame">
        <header className="hero">
          <div className="hero-copy">
            <p className="eyebrow">People Operations</p>
            <h1>Employee Command Center</h1>
            <p className="hero-subtitle">
              Fast workflows, live data visibility, and precise editing in one focused workspace.
            </p>
            <div className="chip-row">
              <span className="chip">React 18 UI</span>
              <span className="chip">Spring Boot API</span>
              <span className="chip">H2 Runtime</span>
            </div>
          </div>
          <aside className="hero-status">
            <div className="status-line">
              <span className={`status-dot ${loading ? "is-loading" : ""}`} />
              <span>{loading ? "Syncing data..." : "Live and ready"}</span>
            </div>
            <p className="status-meta">Endpoint: http://localhost:8080</p>
            <p className="status-meta">
              Showing {filteredEmployees.length} of {employees.length} employees
            </p>
          </aside>
        </header>

        <section className="stats-grid">
          <article className="stat-card">
            <p>Total Employees</p>
            <h3>{employees.length}</h3>
            <small>Active workforce records</small>
          </article>
          <article className="stat-card">
            <p>Total Payroll</p>
            <h3>{formatCurrency(totalPayroll)}</h3>
            <small>Combined salary footprint</small>
          </article>
          <article className="stat-card">
            <p>Average Salary</p>
            <h3>{formatCurrency(averageSalary)}</h3>
            <small>Median-style benchmark view</small>
          </article>
        </section>

        <section className="insights-grid">
          <article className="insight-card">
            <div className="insight-head">
              <p className="card-kicker">Payroll Pulse</p>
              <h2>Salary Momentum</h2>
            </div>
            <p className="insight-copy">
              Sequence of the latest 12 records by ID, tracking how compensation trends evolve.
            </p>
            {salarySeries.length > 1 ? (
              <div className="sparkline-shell">
                <svg
                  viewBox={`0 0 ${SPARKLINE_WIDTH} ${SPARKLINE_HEIGHT}`}
                  className="sparkline"
                  aria-label="Salary trend chart"
                  role="img"
                >
                  <path
                    className="sparkline-area"
                    d={`${sparklinePath} L${SPARKLINE_WIDTH - SPARKLINE_PADDING},${
                      SPARKLINE_HEIGHT - SPARKLINE_PADDING
                    } L${SPARKLINE_PADDING},${SPARKLINE_HEIGHT - SPARKLINE_PADDING} Z`}
                  />
                  <path className="sparkline-line" d={sparklinePath} />
                </svg>
              </div>
            ) : (
              <p className="empty-inline">Add at least two employees to unlock trend visuals.</p>
            )}
          </article>

          <article className="insight-card">
            <div className="insight-head">
              <p className="card-kicker">Workforce Mix</p>
              <h2>Department Balance</h2>
            </div>
            {departmentStats.length === 0 ? (
              <p className="empty-inline">No department analytics yet.</p>
            ) : (
              <div className="dept-stack">
                {departmentStats.slice(0, 5).map((dept) => {
                  const share = employees.length === 0 ? 0 : Math.round((dept.count / employees.length) * 100);
                  return (
                    <div key={dept.department} className="dept-row">
                      <div className="dept-label-row">
                        <span>{dept.department}</span>
                        <span>{dept.count} people</span>
                      </div>
                      <div className="dept-meter">
                        <span style={{ width: `${share}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </article>

          <article className="insight-card">
            <div className="insight-head">
              <p className="card-kicker">Talent Lens</p>
              <h2>Compensation Tiering</h2>
            </div>
            <div className="salary-bands">
              {salaryBandData.map((band) => (
                <div key={band.key} className="salary-band">
                  <div className="band-copy">
                    <span>{band.label}</span>
                    <strong>{band.percent}%</strong>
                  </div>
                  <div className={`band-bar ${band.color}`}>
                    <span style={{ width: `${band.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="top-earners">
              <h3>Top Earners</h3>
              {topEarners.length === 0 ? (
                <p className="empty-inline">No salary leaders yet.</p>
              ) : (
                topEarners.map((employee) => (
                  <div className="earner-row" key={employee.id}>
                    <span className="earner-avatar">{getInitials(employee.name)}</span>
                    <div>
                      <p>{employee.name}</p>
                      <small>{employee.department}</small>
                    </div>
                    <strong>{formatCurrency(employee.salary || 0)}</strong>
                  </div>
                ))
              )}
            </div>
          </article>
        </section>

        <section className="workspace-grid">
          <div className="panel panel-form">
            <EmployeeForm
              mode={mode}
              initial={selected}
              onSubmit={onSubmit}
              loading={loading}
              onCancel={() => {
                setMode("create");
                setSelected(null);
                setServerErrors(null);
              }}
              serverErrors={serverErrors}
            />
          </div>

          <div className="panel panel-table">
            <div className="table-toolbar">
              <input
                className="search-input"
                type="text"
                placeholder="Search name, email, or department"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />

              <select
                className="toolbar-select"
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
              >
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
                <option value="salary-desc">Salary: High to Low</option>
                <option value="salary-asc">Salary: Low to High</option>
                <option value="latest">Newest First</option>
              </select>
            </div>

            <div className="department-chips">
              {departments.map((department) => (
                <button
                  key={department}
                  type="button"
                  className={`department-chip ${
                    departmentFilter === department ? "is-active" : ""
                  }`}
                  onClick={() => setDepartmentFilter(department)}
                >
                  {department}
                </button>
              ))}
            </div>

            <EmployeeTable
              employees={filteredEmployees}
              onEdit={(employee) => {
                setMode("edit");
                setSelected(employee);
                setServerErrors(null);
              }}
              onDelete={handleDelete}
            />
          </div>
        </section>
      </main>
    </div>
  );
}

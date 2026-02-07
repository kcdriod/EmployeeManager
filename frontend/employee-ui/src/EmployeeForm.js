import React, { useEffect, useState } from "react";

const empty = { name: "", email: "", department: "", salary: "" };

export default function EmployeeForm({ mode, initial, onSubmit, onCancel, serverErrors, loading }) {
  const [form, setForm] = useState(empty);

  useEffect(() => {
    if (mode === "edit" && initial) {
      setForm({
        name: initial.name ?? "",
        email: initial.email ?? "",
        department: initial.department ?? "",
        salary: initial.salary ?? "",
      });
    } else {
      setForm(empty);
    }
  }, [mode, initial]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // salary should be number
    const payload = { ...form, salary: Number(form.salary) };
    onSubmit(payload);
  };

  return (
    <section className="form-card">
      <div className="card-head">
        <p className="card-kicker">Employee Profile</p>
        <h2>{mode === "edit" ? "Edit Employee" : "Add Employee"}</h2>
      </div>

      {serverErrors && (
        <div className="error-box" role="alert">
          <b>Validation errors</b>
          <ul>
            {Object.entries(serverErrors).map(([k, v]) => (
              <li key={k}>
                <b>{k}</b>: {v}
              </li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="employee-form">
        <label>
          Full Name
          <input
            name="name"
            placeholder="e.g. Elena Stone"
            value={form.name}
            onChange={handleChange}
            disabled={loading}
            required
          />
        </label>
        <label>
          Email Address
          <input
            name="email"
            type="email"
            placeholder="e.g. elena@company.com"
            value={form.email}
            onChange={handleChange}
            disabled={loading}
            required
          />
        </label>
        <label>
          Department
          <input
            name="department"
            placeholder="e.g. Product, Engineering"
            value={form.department}
            onChange={handleChange}
            disabled={loading}
            required
          />
        </label>
        <label>
          Salary (USD)
          <input
            name="salary"
            type="number"
            min="0"
            step="100"
            placeholder="e.g. 95000"
            value={form.salary}
            onChange={handleChange}
            disabled={loading}
            required
          />
        </label>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {mode === "edit" ? "Save Changes" : "Create Employee"}
          </button>
          {mode === "edit" && (
            <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={loading}>
              Cancel Edit
            </button>
          )}
        </div>
      </form>
    </section>
  );
}

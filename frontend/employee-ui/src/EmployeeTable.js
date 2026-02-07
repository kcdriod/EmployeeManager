import React from "react";

export default function EmployeeTable({ employees, onEdit, onDelete }) {
  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(Number(value || 0));

  return (
    <section className="table-card">
      <div className="card-head">
        <p className="card-kicker">Roster</p>
        <h2>Employees</h2>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Department</th>
              <th>Salary</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.length === 0 ? (
              <tr>
                <td colSpan="6">
                  <div className="empty-state">
                    <h3>No results</h3>
                    <p>Try a different search or add a new employee profile.</p>
                  </div>
                </td>
              </tr>
            ) : (
              employees.map((employee) => (
                <tr key={employee.id}>
                  <td data-label="ID">{employee.id}</td>
                  <td data-label="Name">{employee.name}</td>
                  <td data-label="Email">{employee.email}</td>
                  <td data-label="Department">{employee.department}</td>
                  <td data-label="Salary">{formatCurrency(employee.salary)}</td>
                  <td data-label="Actions">
                    <div className="row-actions">
                      <button type="button" className="btn btn-row" onClick={() => onEdit(employee)}>
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-row btn-danger"
                        onClick={() => onDelete(employee.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

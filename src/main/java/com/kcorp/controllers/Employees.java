package com.kcorp.controllers;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import com.kcorp.model.Employee;
import com.kcorp.service.EmployeeService;
import java.util.List;

@RestController()
public class Employees {
    private final EmployeeService employeeService;

    public Employees(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    @PostMapping("/employees")


    public Employee addEmployee(@Valid @RequestBody Employee employee) {
        return employeeService.addEmployee(employee);
    }
    @GetMapping("/employees")

    public List<Employee> getEmployees() {
        return employeeService.getEmployees();
    }
    @PutMapping("/employees/{id}")
    public Employee updateEmployee(@Valid @RequestBody Employee employee, @PathVariable long id) {
        return employeeService.updateEmployee(id , employee);
    }

}

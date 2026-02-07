package com.kcorp.service;

import com.kcorp.exception.ResourceNotFoundException;
import com.kcorp.model.Employee;
import org.springframework.stereotype.Service;
import com.kcorp.repository.EmployeeRepository;

import java.util.List;

@Service
public class EmployeeService {
    final EmployeeRepository employeeRepository;

    public EmployeeService(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    public Employee addEmployee( Employee employee) {
        employeeRepository.save(employee);
        return employee;
    }
    public List<Employee> getEmployees() {
        return employeeRepository.findAll();
    }
    public Employee updateEmployee(Long id, Employee employee) {
        if (employeeRepository.findById(id).isPresent()) {
           Employee existingEmployee = employeeRepository.findById(id).get();
           existingEmployee.setName(employee.getName());
           existingEmployee.setEmail(employee.getEmail());
           existingEmployee.setDepartment(employee.getDepartment());
           existingEmployee.setSalary(employee.getSalary());
           return employeeRepository.save(existingEmployee);
        } else {
            throw new ResourceNotFoundException("Employee not found id: "+id);
        }

    }
    public void deleteEmployee(Long id) {
        if (employeeRepository.findById(id).isPresent()) {
            employeeRepository.deleteById(id);

        }else {
            throw new ResourceNotFoundException("Employee not found id: "+id);
        }
    }
}

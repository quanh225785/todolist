package com.example.demo.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.entity.TodoTask;
import com.example.demo.service.TodoTaskService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/todos")
@CrossOrigin(origins = "*") // For development with React Vite
@RequiredArgsConstructor
public class TodoTaskController {

    private final TodoTaskService taskService;

    @GetMapping
    public List<TodoTask> getTasksByDate(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return taskService.getTasksByDate(date);
    }

    @GetMapping("/all")
    public List<TodoTask> getAllTasks() {
        return taskService.getAllTasks();
    }

    @PostMapping
    public TodoTask createTask(@RequestBody TodoTask task) {
        return taskService.createTask(task);
    }

    @PostMapping("/batch")
    public List<TodoTask> createMultipleTasks(@RequestBody List<TodoTask> tasks) {
        return taskService.createMultipleTasks(tasks);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TodoTask> updateTask(@PathVariable Long id, @RequestBody TodoTask taskDetails) {
        return ResponseEntity.ok(taskService.updateTask(id, taskDetails));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/copy")
    public List<TodoTask> copyTasks(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(defaultValue = "false") boolean uncompletedOnly) {
        return taskService.copyTasks(fromDate, toDate, uncompletedOnly);
    }
}

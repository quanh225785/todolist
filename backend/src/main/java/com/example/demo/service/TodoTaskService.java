package com.example.demo.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.entity.TodoTask;
import com.example.demo.repository.TodoTaskRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TodoTaskService {

    private final TodoTaskRepository taskRepository;

    public List<TodoTask> getTasksByDate(LocalDate date) {
        return taskRepository.findByTargetDateOrderByPriorityDescCreatedAtAsc(date);
    }

    public List<TodoTask> getAllTasks() {
        return taskRepository.findAll();
    }

    public TodoTask createTask(TodoTask task) {
        return taskRepository.save(task);
    }

    @Transactional
    public List<TodoTask> createMultipleTasks(List<TodoTask> tasks) {
        return taskRepository.saveAll(tasks);
    }

    public TodoTask updateTask(Long id, TodoTask taskDetails) {
        TodoTask task = taskRepository.findById(id).orElseThrow(() -> new RuntimeException("Task not found"));
        task.setContent(taskDetails.getContent());
        task.setCompleted(taskDetails.isCompleted());
        task.setPriority(taskDetails.getPriority());
        task.setTargetDate(taskDetails.getTargetDate());
        return taskRepository.save(task);
    }

    public void deleteTask(Long id) {
        taskRepository.deleteById(id);
    }

    @Transactional
    public List<TodoTask> copyTasks(LocalDate fromDate, LocalDate toDate, boolean copyUncompletedOnly) {
        List<TodoTask> sourceTasks = taskRepository.findByTargetDate(fromDate);
        List<TodoTask> newTasks = new ArrayList<>();
        
        for (TodoTask task : sourceTasks) {
            if (copyUncompletedOnly && task.isCompleted()) {
                continue;
            }
            TodoTask newTask = new TodoTask();
            newTask.setContent(task.getContent());
            newTask.setPriority(task.getPriority());
            newTask.setTargetDate(toDate);
            newTask.setCompleted(false); // Reset status when copying
            newTasks.add(newTask);
        }
        
        return taskRepository.saveAll(newTasks);
    }
}

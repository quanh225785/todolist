package com.example.demo.repository;

import com.example.demo.entity.TodoTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TodoTaskRepository extends JpaRepository<TodoTask, Long> {
    List<TodoTask> findByTargetDateOrderByPriorityDescCreatedAtAsc(LocalDate targetDate);
    List<TodoTask> findByTargetDate(LocalDate targetDate);
}

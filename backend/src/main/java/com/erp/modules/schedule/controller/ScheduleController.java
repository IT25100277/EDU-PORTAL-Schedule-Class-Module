package com.erp.modules.schedule.controller;

import com.erp.common.dto.ApiResponse;
import com.erp.modules.schedule.model.Schedule;
import com.erp.modules.schedule.service.ScheduleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/schedules")
public class ScheduleController {

    @Autowired
    private ScheduleService scheduleService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Schedule>>> getAllSchedules() {
        return ResponseEntity.ok(ApiResponse.success(scheduleService.getAllSchedules()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Schedule>> createSchedule(@RequestBody Schedule schedule) {
        return ResponseEntity.ok(ApiResponse.success("Schedule created successfully", scheduleService.createSchedule(schedule)));
    }

    @GetMapping("/lecturer/{userId}")
    public ResponseEntity<ApiResponse<List<Schedule>>> getByLecturer(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success(scheduleService.getSchedulesByLecturerUserId(userId)));
    }

    @GetMapping("/student/{userId}")
    public ResponseEntity<ApiResponse<List<Schedule>>> getByStudent(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success(scheduleService.getSchedulesByStudentUserId(userId)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSchedule(@PathVariable Long id) {
        scheduleService.deleteSchedule(id);
        return ResponseEntity.ok(ApiResponse.success("Schedule deleted", null));
    }
}

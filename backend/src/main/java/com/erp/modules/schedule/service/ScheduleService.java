package com.erp.modules.schedule.service;

import com.erp.modules.schedule.model.Schedule;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ScheduleService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private final RowMapper<Schedule> scheduleRowMapper = (rs, rowNum) -> {
        Schedule s = new Schedule();
        s.setScheduleId(rs.getLong("schedule_id"));
        s.setCourseId(rs.getLong("course_id"));
        s.setLecturerId(rs.getLong("lecturer_id"));
        s.setRoomId(rs.getLong("room_id"));
        s.setDayOfWeek(rs.getString("day_of_week"));
        s.setStartTime(rs.getString("start_time"));
        s.setEndTime(rs.getString("end_time"));
        
        s.setCourseName(rs.getString("course_name"));
        s.setLecturerName(rs.getString("full_name"));
        s.setRoomNumber(rs.getString("room_number"));
        return s;
    };

    public List<Schedule> getAllSchedules() {
        String sql = "SELECT s.*, c.course_name, u.full_name, r.room_number " +
                     "FROM schedules s " +
                     "JOIN courses c ON s.course_id = c.course_id " +
                     "JOIN lecturers l ON s.lecturer_id = l.lecturer_id " +
                     "JOIN users u ON l.user_id = u.user_id " +
                     "JOIN rooms r ON s.room_id = r.room_id " +
                     "WHERE s.is_active = 1";
        return jdbcTemplate.query(sql, scheduleRowMapper);
    }

    public Schedule createSchedule(Schedule req) {
        String conflictSql = "SELECT COUNT(*) FROM schedules " +
                             "WHERE day_of_week = ? AND is_active = 1 " +
                             "AND (room_id = ? OR lecturer_id = ?) " +
                             "AND start_time < ? AND end_time > ?";
        Integer count = jdbcTemplate.queryForObject(conflictSql, Integer.class, 
                             req.getDayOfWeek(), req.getRoomId(), req.getLecturerId(), req.getEndTime(), req.getStartTime());
                             
        if (count != null && count > 0) {
            throw new RuntimeException("Scheduling conflict detected: The room or lecturer is already booked for this time slot.");
        }

        String sql = "INSERT INTO schedules (course_id, lecturer_id, room_id, day_of_week, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?)";
        jdbcTemplate.update(sql, req.getCourseId(), req.getLecturerId(), req.getRoomId(), req.getDayOfWeek(), req.getStartTime(), req.getEndTime());
        return req;
    }

    public List<Schedule> getSchedulesByLecturerUserId(Long userId) {
        String sql = "SELECT s.*, c.course_name, c.course_code, u.full_name, r.room_number " +
                     "FROM schedules s " +
                     "JOIN courses c ON s.course_id = c.course_id " +
                     "JOIN lecturers l ON s.lecturer_id = l.lecturer_id " +
                     "JOIN users u ON l.user_id = u.user_id " +
                     "JOIN rooms r ON s.room_id = r.room_id " +
                     "WHERE s.is_active = 1";
        
        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            Schedule s = new Schedule();
            s.setScheduleId(rs.getLong("schedule_id"));
            s.setCourseId(rs.getLong("course_id"));
            s.setLecturerId(rs.getLong("lecturer_id"));
            s.setRoomId(rs.getLong("room_id"));
            s.setDayOfWeek(rs.getString("day_of_week"));
            s.setStartTime(rs.getString("start_time"));
            s.setEndTime(rs.getString("end_time"));
            s.setCourseName(rs.getString("course_name"));
            s.setCourseCode(rs.getString("course_code"));
            s.setLecturerName(rs.getString("full_name"));
            s.setRoomNumber(rs.getString("room_number"));
            return s;
        });
    }

    public List<Schedule> getSchedulesByStudentUserId(Long userId) {
        String sql = "SELECT s.*, c.course_name, c.course_code, u.full_name, r.room_number " +
                     "FROM schedules s " +
                     "JOIN courses c ON s.course_id = c.course_id " +
                     "JOIN lecturers l ON s.lecturer_id = l.lecturer_id " +
                     "JOIN users u ON l.user_id = u.user_id " +
                     "JOIN rooms r ON s.room_id = r.room_id " +
                     "WHERE s.is_active = 1 " +
                     "AND EXISTS (" +
                     "   SELECT 1 FROM enrollments e " +
                     "   JOIN students st ON e.student_id = st.student_id " +
                     "   WHERE e.course_id = s.course_id AND st.user_id = ? AND e.status = 'ACTIVE'" +
                     ")";
                     
        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            Schedule s = new Schedule();
            s.setScheduleId(rs.getLong("schedule_id"));
            s.setCourseId(rs.getLong("course_id"));
            s.setLecturerId(rs.getLong("lecturer_id"));
            s.setRoomId(rs.getLong("room_id"));
            s.setDayOfWeek(rs.getString("day_of_week"));
            s.setStartTime(rs.getString("start_time"));
            s.setEndTime(rs.getString("end_time"));
            s.setCourseName(rs.getString("course_name"));
            s.setCourseCode(rs.getString("course_code"));
            s.setLecturerName(rs.getString("full_name"));
            s.setRoomNumber(rs.getString("room_number"));
            return s;
        }, userId);
    }

    public void deleteSchedule(Long id) {
        jdbcTemplate.update("DELETE FROM schedules WHERE schedule_id = ?", id);
    }
}

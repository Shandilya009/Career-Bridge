using Microsoft.AspNetCore.Mvc;
using CareerBridge.Application.DTOs.Auth;
using CareerBridge.Application.Interfaces;
using CareerBridge.Domain.Entities;
using CareerBridge.Domain.Enums;

namespace CareerBridge.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IUserRepository     _users;
    private readonly IStudentRepository  _students;
    private readonly IRecruiterRepository _recruiters;
    private readonly IJwtService         _jwt;

    public AuthController(IUserRepository users, IStudentRepository students,
        IRecruiterRepository recruiters, IJwtService jwt)
    {
        _users = users; _students = students;
        _recruiters = recruiters; _jwt = jwt;
    }

    [HttpPost("register/student")]
    public async Task<IActionResult> RegisterStudent([FromBody] RegisterStudentDto dto)
    {
        if (await _users.GetByEmailAsync(dto.Email) != null)
            return Conflict(new { message = "Email already registered." });

        var user = new User
        {
            Email        = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role         = Role.Student,
            IsEmailVerified = true
        };
        await _users.CreateAsync(user);

        var student = new Student
        {
            UserId         = user.Id,
            FirstName      = dto.FirstName,
            LastName       = dto.LastName,
            Department     = dto.Department,
            GraduationYear = dto.GraduationYear
        };
        await _students.CreateAsync(student);

        return Ok(new { message = "Student registered successfully." });
    }

    [HttpPost("register/recruiter")]
    public async Task<IActionResult> RegisterRecruiter([FromBody] RegisterRecruiterDto dto)
    {
        if (await _users.GetByEmailAsync(dto.Email) != null)
            return Conflict(new { message = "Email already registered." });

        var user = new User
        {
            Email        = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role         = Role.Recruiter,
            IsEmailVerified = true
        };
        await _users.CreateAsync(user);

        var recruiter = new Recruiter
        {
            UserId        = user.Id,
            CompanyName   = dto.CompanyName,
            ContactPerson = dto.ContactPerson,
            Industry      = dto.Industry,
            IsApproved    = false
        };
        await _recruiters.CreateAsync(recruiter);

        return Ok(new { message = "Recruiter registered. Awaiting admin approval." });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var user = await _users.GetByEmailAsync(dto.Email);
        if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            return Unauthorized(new { message = "Invalid credentials." });

        if (!user.IsActive)
            return Unauthorized(new { message = "Account is blocked." });

        string name = "";
        if (user.Role == Role.Student)
        {
            var s = await _students.GetByUserIdAsync(user.Id);
            name = s != null ? $"{s.FirstName} {s.LastName}" : user.Email;
        }
        else if (user.Role == Role.Recruiter)
        {
            var r = await _recruiters.GetByUserIdAsync(user.Id);
            name = r?.CompanyName ?? user.Email;
        }
        else name = "Admin";

        var token = _jwt.GenerateToken(user);
        var refresh = _jwt.GenerateRefreshToken();

        return Ok(new AuthResponseDto
        {
            Token        = token,
            RefreshToken = refresh,
            Role         = user.Role.ToString(),
            UserId       = user.Id,
            Name         = name
        });
    }
}

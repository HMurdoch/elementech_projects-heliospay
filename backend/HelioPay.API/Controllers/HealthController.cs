using Microsoft.AspNetCore.Mvc;

namespace HelioPay.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    [HttpGet] public IActionResult Get() => Ok(new { status="ok", time=DateTime.UtcNow });
}

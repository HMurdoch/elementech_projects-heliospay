using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace HelioPay.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    /// <summary>Returns the service health status.</summary>
    /// <remarks>Useful for liveness/readiness probes and uptime checks.</remarks>
    [HttpGet]
    [SwaggerOperation(
        Summary = "Service health check",
        Description = "Returns <c>status</c> and the current UTC <c>time</c>."
    )]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public IActionResult Get() => Ok(new { status = "ok", time = DateTime.UtcNow });
}
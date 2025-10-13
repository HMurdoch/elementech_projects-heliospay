using HelioPay.API.Data;     // your DbContext namespace
using Microsoft.EntityFrameworkCore;
using Npgsql;

var builder = WebApplication.CreateBuilder(args);

// -------------------- Services --------------------
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ----- DB connection: Dev uses appsettings(local); Prod uses env var -----
var config = builder.Configuration;

// Priority: appsettings ConnectionStrings:Default -> env var -> DATABASE_URL
var cs = config.GetConnectionString("Default")
         ?? Environment.GetEnvironmentVariable("ConnectionStrings__Default")
         ?? Environment.GetEnvironmentVariable("DATABASE_URL");

if (string.IsNullOrWhiteSpace(cs))
    throw new InvalidOperationException("Database connection string not provided.");

// Convert postgres URL to Npgsql format if needed (adds SSL for Render)
if (cs.StartsWith("postgres", StringComparison.OrdinalIgnoreCase))
{
    var uri = new Uri(cs);
    var ui = uri.UserInfo.Split(':', 2);
    var npg = new NpgsqlConnectionStringBuilder
    {
        Host = uri.Host,
        Port = uri.Port > 0 ? uri.Port : 5432,
        Database = uri.AbsolutePath.Trim('/'),
        Username = ui.ElementAtOrDefault(0) ?? "",
        Password = ui.ElementAtOrDefault(1) ?? "",
        SslMode = SslMode.Require,
        TrustServerCertificate = true
    };
    cs = npg.ToString();
}

builder.Services.AddDbContext<AppDbContext>(opt => opt.UseNpgsql(cs));

var app = builder.Build();

// -------------------- Pipeline --------------------
// Swagger ALWAYS on (dev + prod)
app.UseSwagger();
app.UseSwaggerUI(opt =>
{
    // UI lives at /swagger
    opt.RoutePrefix = "swagger";
    // JSON at /swagger/v1/swagger.json
    opt.SwaggerEndpoint("/swagger/v1/swagger.json", "HeliosPay API v1");
});

// Optional redirect: open root -> /swagger
app.MapGet("/", ctx =>
{
    ctx.Response.Redirect("/swagger", permanent: false);
    return Task.CompletedTask;
});

// Health check for Render
app.MapGet("/health", () => Results.Ok(new { ok = true, ts = DateTimeOffset.UtcNow }));

app.UseRouting();
app.UseAuthorization();
app.MapControllers();

// Helpful startup log: which DB are we using?
try
{
    var b = new NpgsqlConnectionStringBuilder(cs);
    app.Logger.LogInformation("DB host: {Host} db: {Db}", b.Host, b.Database);
}
catch { /* ignore */ }

app.Run();

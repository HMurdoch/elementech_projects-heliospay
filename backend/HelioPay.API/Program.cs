    using HelioPay.API.Data;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.OpenApi.Models;
    using System.Text.Json.Serialization;

    var builder = WebApplication.CreateBuilder(args);

    // --- Connection string ---
    var conn =
        builder.Configuration.GetConnectionString("Default")
        ?? builder.Configuration["ConnectionStrings:Default"]
        ?? "Host=localhost;Port=5432;Database=heliospay;Username=helios;Password=P@$$w0rd";

// --- CORS (single policy for the SPA) ---
    var AllowLocal = "AllowLocal";

    builder.Services.AddCors(options =>
    {
        options.AddPolicy(AllowLocal, p =>
            p.WithOrigins(
                    "http://localhost:3000",
                    "https://localhost:3000"  // add https too
                )
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials());       // keep if you ever use cookies/auth
    });

// --- EF + Controllers ---
builder.Services.AddDbContext<AppDbContext>(opt => opt.UseNpgsql(conn));
    builder.Services.AddControllers()
        .AddJsonOptions(o =>
        {
            // avoid reference loops in Account <-> Transactions
            o.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
            o.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
        });


    // --- Swagger ---
    builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen(c =>
        {
            c.SwaggerDoc("v1", new OpenApiInfo { Title = "HelioPay API", Version = "v1" });
            c.EnableAnnotations();

            // Include XML comments only if the file exists (avoids 500s)
            var xml = Path.Combine(AppContext.BaseDirectory, "HelioPay.API.xml");
            if (File.Exists(xml))
                c.IncludeXmlComments(xml);
        });

    var app = builder.Build();
    app.UseCors(AllowLocal);
    // --- DB migrate + seed on startup ---
    using (var scope = app.Services.CreateScope())
    {
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        if (args.Any(a => a.Equals("--reseed", StringComparison.OrdinalIgnoreCase)))
            await SeedData.RebuildAsync(db);
        else
            await SeedData.EnsureAsync(db);
    }

    // --- Middleware pipeline ---
    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI(ui =>
        {
            ui.SwaggerEndpoint("/swagger/v1/swagger.json", "HelioPay API v1");
            ui.RoutePrefix = "swagger"; // Swagger lives at /swagger
            ui.DisplayRequestDuration();
            ui.EnableDeepLinking();
        });
    }

    //app.UseHttpsRedirection();
    app.UseRouting();

    app.UseAuthentication();
    app.UseAuthorization();

    app.MapControllers();

    app.Run();

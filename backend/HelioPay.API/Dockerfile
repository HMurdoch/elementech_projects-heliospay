# ---------- build ----------
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy the entire repo into the image
COPY . .

# Move into the API project folder and publish
WORKDIR /src/backend/HelioPay.API
RUN dotnet restore
RUN dotnet publish HelioPay.API.csproj -c Release -o /app /p:UseAppHost=false

# ---------- run ----------
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app ./

# Render provides $PORT—bind Kestrel to it
ENV ASPNETCORE_URLS=http://0.0.0.0:${PORT}
# Optional: culture invariant
ENV DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=1

# (Not required by Render, but fine:)
EXPOSE 8080

ENTRYPOINT ["dotnet","HelioPay.API.dll"]

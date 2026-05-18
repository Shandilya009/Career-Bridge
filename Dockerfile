FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj and restore
COPY CareerBridge.sln ./
COPY CareerBridge.API/CareerBridge.API.csproj CareerBridge.API/
COPY CareerBridge.Application/CareerBridge.Application.csproj CareerBridge.Application/
COPY CareerBridge.Domain/CareerBridge.Domain.csproj CareerBridge.Domain/
COPY CareerBridge.Infrastructure/CareerBridge.Infrastructure.csproj CareerBridge.Infrastructure/
RUN dotnet restore

# Copy everything else and build
COPY . .
WORKDIR /src/CareerBridge.API
RUN dotnet publish -c Release -o /app/publish

# Build runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "CareerBridge.API.dll"]

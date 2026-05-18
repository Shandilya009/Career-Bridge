using System;
using System.IO;
using System.Collections.Generic;

namespace CareerBridge.Scaffolder
{
    class Program
    {
        static void Main()
        {
            var dirs = new string[] { 
                "CareerBridge.API", 
                "CareerBridge.Domain", 
                "CareerBridge.Infrastructure", 
                "CareerBridge.Application",
                "frontend/src",
                "frontend/public"
            };
            
            var outLines = new List<string>();
            outLines.Add("using System.IO;");
            outLines.Add("namespace CareerBridge.Scaffolder;");
            outLines.Add("public static class Generator {");
            outLines.Add("    public static void Run() {");
            
            foreach(var dir in dirs) 
            {
                var fullDir = Path.Combine("..", dir);
                if (!Directory.Exists(fullDir)) continue;
                
                foreach(var file in Directory.GetFiles(fullDir, "*.*", SearchOption.AllDirectories)) 
                {
                    if(file.Contains("/bin/") || file.Contains("/obj/") || file.Contains("node_modules") || file.EndsWith(".DS_Store")) continue;
                    
                    var content = File.ReadAllText(file).Replace("\"", "\"\"");
                    var relativePath = file.Replace("../", "").Replace("\\", "/");
                    
                    outLines.Add($"        Directory.CreateDirectory(Path.GetDirectoryName(\"{relativePath}\"));");
                    outLines.Add($"        File.WriteAllText(\"{relativePath}\", @\"{content}\");");
                }
            }
            
            var rootFiles = new string[] { "start_backend.sh", "start_frontend.sh", "docker-compose.yml", "CareerBridge.sln" };
            foreach(var file in rootFiles) {
                var fullFile = Path.Combine("..", file);
                if (File.Exists(fullFile)) {
                    var content = File.ReadAllText(fullFile).Replace("\"", "\"\"");
                    outLines.Add($"        File.WriteAllText(\"{file}\", @\"{content}\");");
                }
            }
            
            outLines.Add("        System.Console.WriteLine(\"Scaffolding complete!\");");
            outLines.Add("    }");
            outLines.Add("}");
            
            File.WriteAllText("Generator.cs", string.Join("\n", outLines));
            Console.WriteLine("Successfully generated Generator.cs with embedded workspace code!");
        }
    }
}

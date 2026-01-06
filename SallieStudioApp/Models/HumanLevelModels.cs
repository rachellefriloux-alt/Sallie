using System.Collections.Generic;

namespace SallieStudioApp.Models
{
    // Human-Level Expansion Models
    
    public class SallieLimbicState
    {
        public Dictionary<string, float> LimbicVariables { get; set; } = new();
        public int AutonomyLevel { get; set; }
        public string TrustTier { get; set; } = "";
        
        // Convenience properties
        public float Trust => LimbicVariables.GetValueOrDefault("trust", 0f);
        public float Empathy => LimbicVariables.GetValueOrDefault("empathy", 0f);
        public float Intuition => LimbicVariables.GetValueOrDefault("intuition", 0f);
        public float Creativity => LimbicVariables.GetValueOrDefault("creativity", 0f);
        public float Wisdom => LimbicVariables.GetValueOrDefault("wisdom", 0f);
        public float Humor => LimbicVariables.GetValueOrDefault("humor", 0f);
        public float Warmth => LimbicVariables.GetValueOrDefault("warmth", 0f);
        public float Arousal => LimbicVariables.GetValueOrDefault("arousal", 0f);
        public float Valence => LimbicVariables.GetValueOrDefault("valence", 0f);
        public float Posture => LimbicVariables.GetValueOrDefault("posture", 0f);
    }
    
    public class SallieCognitiveState
    {
        public List<string> ActiveModels { get; set; } = new();
        public float ReasoningConfidence { get; set; }
        public string DynamicPosture { get; set; } = "";
        public int LearningMemorySize { get; set; }
        public int CrossDomainPatterns { get; set; }
        
        // Convenience properties
        public bool IsLogicalReasoning => ActiveModels.Contains("logical");
        public bool IsCreativeReasoning => ActiveModels.Contains("creative");
        public bool IsEmotionalReasoning => ActiveModels.Contains("emotional");
        public bool IsIntuitiveReasoning => ActiveModels.Contains("intuitive");
        public bool IsMultiModel => ActiveModels.Count > 1;
    }
    
    public class EnhancementRequest
    {
        public string Variable { get; set; } = "";
        public float Delta { get; set; }
    }
    
    public class EnhancementResponse
    {
        public bool Success { get; set; }
        public float NewValue { get; set; }
        public string Message { get; set; } = "";
    }
    
    public class PostureHistory
    {
        public string CurrentPosture { get; set; } = "";
        public List<PostureChange> History { get; set; } = new();
        public float AdaptationRate { get; set; }
    }
    
    public class PostureChange
    {
        public string From { get; set; } = "";
        public string To { get; set; } = "";
        public Dictionary<string, object> Context { get; set; } = new();
        public double Timestamp { get; set; }
    }
    
    public class LearningPatterns
    {
        public Dictionary<string, LearningPattern> Patterns { get; set; } = new();
        public int TotalLearned { get; set; }
        public float LearningRate { get; set; }
    }
    
    public class LearningPattern
    {
        public List<string> Contexts { get; set; } = new();
        public List<string> ReasoningApproaches { get; set; } = new();
        public float SuccessRate { get; set; }
    }
    
    public class ReasoningModels
    {
        public List<string> AvailableModels { get; set; } = new();
        public Dictionary<string, float> LimbicInfluence { get; set; } = new();
    }
}

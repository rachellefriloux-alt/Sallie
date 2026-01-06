'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Brain, Heart, Lightbulb, Sparkles, Wisdom, Laugh } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.1.47:8742';

interface LimbicState {
  limbic_variables: Record<string, number>;
  autonomy_level: number;
  trust_tier: string;
}

interface CognitiveState {
  active_models: string[];
  reasoning_confidence: number;
  dynamic_posture: string;
  learning_memory_size: number;
  cross_domain_patterns: number;
}

interface EnhancementRequest {
  variable: string;
  delta: number;
}

export function HumanLevelExpansion() {
  const [limbicState, setLimbicState] = useState<LimbicState | null>(null);
  const [cognitiveState, setCognitiveState] = useState<CognitiveState | null>(null);
  const [loading, setLoading] = useState(true);
  const [enhancing, setEnhancing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [limbicResponse, cognitiveResponse] = await Promise.all([
          fetch(`${API_BASE}/limbic`),
          fetch(`${API_BASE}/cognitive`)
        ]);

        if (limbicResponse.ok && cognitiveResponse.ok) {
          const [limbicData, cognitiveData] = await Promise.all([
            limbicResponse.json(),
            cognitiveResponse.json()
          ]);

          setLimbicState(limbicData);
          setCognitiveState(cognitiveData);
        }
      } catch (error) {
        console.error('Failed to fetch human-level data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const handleEnhancement = async (variable: string, delta: number) => {
    setEnhancing(true);
    try {
      const response = await fetch(`${API_BASE}/enhance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ variable, delta }),
      });

      if (response.ok) {
        const result = await response.json();
        // Refresh limbic state
        const limbicResponse = await fetch(`${API_BASE}/limbic`);
        if (limbicResponse.ok) {
          const newLimbicState = await limbicResponse.json();
          setLimbicState(newLimbicState);
        }
      }
    } catch (error) {
      console.error('Enhancement failed:', error);
    } finally {
      setEnhancing(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Human-Level Expansion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!limbicState || !cognitiveState) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Human-Level Expansion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Human-level expansion features not available</p>
        </CardContent>
      </Card>
    );
  }

  const limbicVariables = [
    { key: 'trust', label: 'Trust', icon: Heart, color: 'bg-red-500' },
    { key: 'empathy', label: 'Empathy', icon: Heart, color: 'bg-pink-500' },
    { key: 'intuition', label: 'Intuition', icon: Sparkles, color: 'bg-purple-500' },
    { key: 'creativity', label: 'Creativity', icon: Lightbulb, color: 'bg-yellow-500' },
    { key: 'wisdom', label: 'Wisdom', icon: Wisdom, color: 'bg-blue-500' },
    { key: 'humor', label: 'Humor', icon: Laugh, color: 'bg-green-500' },
  ];

  const getTrustTierColor = (tier: string) => {
    if (tier.includes('Full_Partner')) return 'bg-purple-500';
    if (tier.includes('Surrogate')) return 'bg-blue-500';
    if (tier.includes('Colleague')) return 'bg-green-500';
    if (tier.includes('Acquaintance')) return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  return (
    <div className="space-y-6">
      {/* Trust Tier Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Trust Level
            </span>
            <Badge className={getTrustTierColor(limbicState.trust_tier)}>
              {limbicState.trust_tier.replace('_', ' ')}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Autonomy Level</span>
              <span className="font-semibold">Tier {limbicState.autonomy_level}/4</span>
            </div>
            <Progress value={(limbicState.autonomy_level / 4) * 100} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Limbic Variables */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Limbic System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {limbicVariables.map(({ key, label, icon: Icon, color }) => {
              const value = limbicState.limbic_variables[key] || 0;
              return (
                <div key={key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{label}</span>
                    </div>
                    <span className="text-sm text-gray-500">{value.toFixed(2)}</span>
                  </div>
                  <Progress value={value * 100} className="h-2" />
                  {limbicState.autonomy_level === 4 && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEnhancement(key, -0.1)}
                        disabled={enhancing || value <= 0}
                      >
                        -
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEnhancement(key, 0.1)}
                        disabled={enhancing || value >= 1}
                      >
                        +
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Cognitive State */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Cognitive Processing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Active Reasoning Models</span>
                <Badge variant="outline">
                  {cognitiveState.active_models.length} active
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                {cognitiveState.active_models.map((model) => (
                  <Badge key={model} variant="secondary">
                    {model}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Reasoning Confidence</span>
                <span>{(cognitiveState.reasoning_confidence * 100).toFixed(0)}%</span>
              </div>
              <Progress value={cognitiveState.reasoning_confidence * 100} className="h-2" />
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Dynamic Posture</span>
                <p className="font-medium capitalize">{cognitiveState.dynamic_posture}</p>
              </div>
              <div>
                <span className="text-gray-500">Learning Memory</span>
                <p className="font-medium">{cognitiveState.learning_memory_size} items</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

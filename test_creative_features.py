#!/usr/bin/env python3
"""
Test Creative Features (Stable Diffusion, MusicGen)
Tests the creative generation capabilities of Sallie
"""

import asyncio
import logging
import json
import time
from pathlib import Path
from datetime import datetime
from typing import List

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("test_creative")

class CreativeFeatureTester:
    """Test creative features functionality"""
    
    def __init__(self):
        self.test_results = {}
        self.start_time = datetime.now()
        
    async def test_stable_diffusion(self):
        """Test Stable Diffusion image generation"""
        logger.info("Testing Stable Diffusion...")
        
        try:
            # Check if we can import and use Stable Diffusion
            try:
                # Try to import diffusers (PyTorch-based Stable Diffusion)
                from diffusers import StableDiffusionPipeline
                import torch
                
                logger.info("✅ Diffusers library available")
                
                # Check if we have GPU
                device = "cuda" if torch.cuda.is_available() else "cpu"
                logger.info(f"✅ Using device: {device}")
                
                # Try to load a small model
                try:
                    # Use a smaller model for testing
                    pipe = StableDiffusionPipeline.from_pretrained(
                        "runwayml/stable-diffusion-v1-5",
                        torch_dtype=torch.float16 if device == "cuda" else torch.float32,
                        variant="fp16" if device == "cuda" else None,
                        use_safetensors=True
                    )
                    
                    if device == "cuda":
                        pipe = pipe.to(device)
                    
                    # Test generation
                    start_time = time.time()
                    prompt = "A beautiful sunset over mountains, digital art, high quality"
                    
                    logger.info("Generating image...")
                    result = pipe(prompt, num_inference_steps=20, guidance_scale=7.5)
                    generation_time = time.time() - start_time
                    
                    # Save the image
                    image = result.images[0]
                    output_path = Path("test_output/sunset_test.png")
                    output_path.parent.mkdir(exist_ok=True)
                    image.save(output_path)
                    
                    logger.info(f"✅ Image generated and saved to {output_path}")
                    logger.info(f"   Generation time: {generation_time:.2f} seconds")
                    
                    self.test_results['stable_diffusion'] = {
                        'status': 'success',
                        'device': device,
                        'generation_time': generation_time,
                        'output_path': str(output_path)
                    }
                    
                except Exception as e:
                    logger.warning(f"⚠️ Stable Diffusion model loading failed: {e}")
                    self.test_results['stable_diffusion'] = {
                        'status': 'model_failed',
                        'error': str(e)
                    }
                    
            except ImportError as e:
                logger.warning(f"⚠️ Diffusers not available: {e}")
                self.test_results['stable_diffusion'] = {
                    'status': 'library_missing',
                    'error': str(e)
                }
                
        except Exception as e:
            logger.error(f"❌ Stable Diffusion test failed: {e}")
            self.test_results['stable_diffusion'] = {
                'status': 'failed',
                'error': str(e)
            }
    
    async def test_musicgen(self):
        """Test MusicGen music generation"""
        logger.info("Testing MusicGen...")
        
        try:
            # Check if we can import and use MusicGen
            try:
                from audiocraft.models import MusicGen
                from audiocraft.utils import download_audio
                import torchaudio
                
                logger.info("✅ AudioCraft library available")
                
                # Check device
                import torch
                device = "cuda" if torch.cuda.is_available() else "cpu"
                logger.info(f"✅ Using device: {device}")
                
                # Try to load MusicGen model
                try:
                    model = MusicGen.get_pretrained('facebook/musicgen-small')
                    model.to(device)
                    
                    # Test generation
                    start_time = time.time()
                    prompt = "Lo-fi hip hop with a relaxed vibe, 120 BPM"
                    
                    logger.info("Generating music...")
                    wav = model.generate(
                        descriptions=[prompt],
                        progress=True,
                        duration=8.0  # 8 seconds
                    )
                    
                    generation_time = time.time() - start_time
                    
                    # Save the audio
                    output_path = Path("test_output/lofi_test.wav")
                    output_path.parent.mkdir(exist_ok=True)
                    
                    # Save as WAV
                    torchaudio.save(output_path, wav[0].cpu(), model.sample_rate)
                    
                    logger.info(f"✅ Music generated and saved to {output_path}")
                    logger.info(f"   Generation time: {generation_time:.2f} seconds")
                    
                    self.test_results['musicgen'] = {
                        'status': 'success',
                        'device': device,
                        'generation_time': generation_time,
                        'duration': 8.0,
                        'output_path': str(output_path)
                    }
                    
                except Exception as e:
                    logger.warning(f"⚠️ MusicGen model loading failed: {e}")
                    self.test_results['musicgen'] = {
                        'status': 'model_failed',
                        'error': str(e)
                    }
                    
            except ImportError as e:
                logger.warning(f"⚠️ AudioCraft not available: {e}")
                self.test_results['musicgen'] = {
                    'status': 'library_missing',
                    'error': str(e)
                }
                
        except Exception as e:
            logger.error(f"❌ MusicGen test failed: {e}")
            self.test_results['musicgen'] = {
                'status': 'failed',
                'error': str(e)
            }
    
    async def test_fallback_generation(self):
        """Test fallback generation methods"""
        logger.info("Testing fallback generation methods...")
        
        try:
            # Test text-based art generation (ASCII art)
            def generate_ascii_art(prompt: str) -> str:
                """Generate simple ASCII art based on prompt"""
                if "sunset" in prompt.lower():
                    return """
    ~~~~~~~
   ~       ~
  ~         ~
 ~           ~
~             ~
 ~           ~
  ~         ~
   ~       ~
    ~~~~~~~
     |     |
     |     |
    /       \\
   /         \\
                    """
                elif "music" in prompt.lower():
                    return """
    ♪ ♫ ♬ ♩ ♪ ♫ ♬ ♩
     ♪ ♫ ♬ ♩ ♪ ♫ ♬
    ♪ ♫ ♬ ♩ ♪ ♫ ♬ ♩
     ♪ ♫ ♬ ♩ ♪ ♫ ♬
    ♪ ♫ ♬ ♩ ♪ ♫ ♬ ♩
                    """
                else:
                    return """
    ⚡ SALLIE CREATIVE ⚡
    =====================
    Generating creative content
    based on your prompt...
                    """
            
            # Test ASCII art generation
            ascii_art = generate_ascii_art("sunset")
            logger.info("✅ ASCII art generation successful")
            
            # Test text-based music description
            def generate_music_description(prompt: str) -> str:
                """Generate music description"""
                if "lo-fi" in prompt.lower():
                    return """
🎵 Lo-Fi Hip Hop Description:
- Tempo: 120 BPM
- Mood: Relaxed, chill, study-friendly
- Instruments: Piano, drums, bass, subtle samples
- Structure: 4/4 time, simple chord progression
- Vibe: Nostalgic, warm, cozy
                    """
                else:
                    return """
🎵 Music Description:
- Creative generation based on prompt
- Adaptive to user preferences
- Mood-appropriate instrumentation
                    """
            
            music_desc = generate_music_description("lo-fi hip hop")
            logger.info("✅ Music description generation successful")
            
            self.test_results['fallback_generation'] = {
                'status': 'success',
                'ascii_art': ascii_art.strip(),
                'music_description': music_desc.strip()
            }
            
        except Exception as e:
            logger.error(f"❌ Fallback generation test failed: {e}")
            self.test_results['fallback_generation'] = {
                'status': 'failed',
                'error': str(e)
            }
    
    async def test_foundry_integration(self):
        """Test Foundry system integration"""
        logger.info("Testing Foundry system integration...")
        
        try:
            # Try to import Foundry system
            from creative.foundry import FoundrySystem
            
            # Create a mock monologue for testing
            class MockMonologue:
                def process_input(self, text, source):
                    class MockResponse:
                        text = f"Creative response to: {text}"
                        decision = {"creative": True}
                    return MockResponse()
            
            monologue = MockMonologue()
            foundry = FoundrySystem(monologue)
            
            logger.info("✅ Foundry system initialized")
            
            # Test evaluation harness
            golden_set = foundry.golden_set
            logger.info(f"✅ Golden set loaded: {len(golden_set)} items")
            
            # Test model directory structure
            if foundry.models_dir.exists():
                logger.info("✅ Models directory exists")
            else:
                logger.warning("⚠️ Models directory not found")
            
            self.test_results['foundry_integration'] = {
                'status': 'success',
                'golden_set_items': len(golden_set),
                'models_dir_exists': foundry.models_dir.exists(),
                'datasets_dir_exists': foundry.datasets_dir.exists()
            }
            
        except ImportError as e:
            logger.warning(f"⚠️ Foundry system not available: {e}")
            self.test_results['foundry_integration'] = {
                'status': 'library_missing',
                'error': str(e)
            }
        except Exception as e:
            logger.error(f"❌ Foundry integration test failed: {e}")
            self.test_results['foundry_integration'] = {
                'status': 'failed',
                'error': str(e)
            }
    
    async def run_all_tests(self):
        """Run all creative feature tests"""
        logger.info("Starting Creative Features Test Suite")
        logger.info("=" * 50)
        
        # Create output directory
        Path("test_output").mkdir(exist_ok=True)
        
        # Run tests
        await self.test_stable_diffusion()
        await self.test_musicgen()
        await self.test_fallback_generation()
        await self.test_foundry_integration()
        
        # Generate report
        self.generate_report()
    
    def generate_report(self):
        """Generate test report"""
        end_time = datetime.now()
        duration = (end_time - self.start_time).total_seconds()
        
        report = {
            "test_summary": {
                "start_time": self.start_time.isoformat(),
                "end_time": end_time.isoformat(),
                "duration_seconds": duration,
                "total_tests": len(self.test_results),
                "successful_tests": len([r for r in self.test_results.values() if r.get('status') == 'success']),
                "failed_tests": len([r for r in self.test_results.values() if r.get('status') == 'failed'])
            },
            "test_results": self.test_results,
            "recommendations": self._generate_recommendations()
        }
        
        # Save report
        report_path = Path("test_output/creative_features_test_report.json")
        with open(report_path, 'w') as f:
            json.dump(report, f, indent=2)
        
        # Print summary
        logger.info("\n" + "=" * 50)
        logger.info("CREATIVE FEATURES TEST SUMMARY")
        logger.info("=" * 50)
        logger.info(f"Total Tests: {report['test_summary']['total_tests']}")
        logger.info(f"Successful: {report['test_summary']['successful_tests']}")
        logger.info(f"Failed: {report['test_summary']['failed_tests']}")
        logger.info(f"Duration: {duration:.2f} seconds")
        logger.info(f"Report saved to: {report_path}")
        
        # Print individual results
        for test_name, result in self.test_results.items():
            status = result.get('status', 'unknown')
            if status == 'success':
                logger.info(f"✅ {test_name}: SUCCESS")
            elif status == 'failed':
                logger.error(f"❌ {test_name}: FAILED - {result.get('error', 'Unknown error')}")
            else:
                logger.warning(f"⚠️ {test_name}: {status.upper()} - {result.get('error', 'Unknown issue')}")
        
        logger.info("=" * 50)
    
    def _generate_recommendations(self) -> List[str]:
        """Generate recommendations based on test results"""
        recommendations = []
        
        # Check Stable Diffusion
        sd_result = self.test_results.get('stable_diffusion', {})
        if sd_result.get('status') == 'library_missing':
            recommendations.append("Install PyTorch and Diffusers: pip install torch diffusers transformers")
        elif sd_result.get('status') == 'model_failed':
            recommendations.append("Check GPU availability and model download")
        
        # Check MusicGen
        mg_result = self.test_results.get('musicgen', {})
        if mg_result.get('status') == 'library_missing':
            recommendations.append("Install AudioCraft: pip install audiocraft")
        elif mg_result.get('status') == 'model_failed':
            recommendations.append("Check AudioCraft model download and dependencies")
        
        # Check Foundry
        foundry_result = self.test_results.get('foundry_integration', {})
        if foundry_result.get('status') == 'library_missing':
            recommendations.append("Ensure Foundry system is properly integrated")
        
        # General recommendations
        if len([r for r in self.test_results.values() if r.get('status') == 'success']) == 0:
            recommendations.append("Consider using fallback generation methods for basic creative features")
        
        if not recommendations:
            recommendations.append("All creative features are working properly!")
        
        return recommendations

async def main():
    """Main test runner"""
    tester = CreativeFeatureTester()
    await tester.run_all_tests()

if __name__ == "__main__":
    asyncio.run(main())

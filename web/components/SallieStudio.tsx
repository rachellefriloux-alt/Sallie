'use client';

import React, { useState, useEffect } from 'react';
import { PrismCore } from './prism/PrismCore';

export function SallieStudio() {
  return (
    <div className="studio-container h-screen overflow-hidden bg-gradient-to-br from-sand-50 to-peacock-50">
      <PrismCore className="h-full" />
    </div>
  );
}

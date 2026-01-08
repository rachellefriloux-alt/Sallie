'use client';

import React, { useState, useEffect } from 'react';
import { SallieStudioOS } from './SallieStudioOS';

export function SallieStudio() {
  return (
    <div className="studio-container h-screen overflow-hidden">
      <SallieStudioOS />
    </div>
  );
}

'use client';

import * as React from 'react';
import * as SwitchPrimitives from '@radix-ui/react-switch';
import clsx from 'clsx';

export function HzSwitch({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <SwitchPrimitives.Root
      checked={checked}
      onCheckedChange={onChange}
      disabled={disabled}
      className={clsx(
        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-[#B6192E]" : "bg-gray-200"
      )}
    >
      <SwitchPrimitives.Thumb
        className={clsx(
          "pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform",
          checked ? "translate-x-4" : "translate-x-0"
        )}
      />
    </SwitchPrimitives.Root>
  );
}
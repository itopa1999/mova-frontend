import {
  Check,
  Eye,
  EyeOff,
  X,
} from 'lucide-react'
import {
  useState,
  type ChangeEvent,
} from 'react'
import { useTheme } from '../../hooks/useTheme'
import {
  colors,
  darkColors,
} from '../../styles/tokens'

export type InputValidationState =
  | 'neutral'
  | 'valid'
  | 'invalid'

interface InputProps {
  label: string
  name: string
  type?: 'text' | 'email' | 'tel' | 'password'
  placeholder?: string
  value: string
  onChange: (
    event: ChangeEvent<HTMLInputElement>,
  ) => void
  onBlur?: () => void
  error?: string
  touched?: boolean
  required?: boolean
  disabled?: boolean
  autoComplete?: string
  maxLength?: number
}

export default function Input({
  label,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  touched = false,
  required = false,
  disabled = false,
  autoComplete,
  maxLength,
}: InputProps) {
  const [showPassword, setShowPassword] =
    useState(false)

  const [focused, setFocused] =
    useState(false)

  const { isDark } = useTheme()

  const themeColors = isDark
    ? darkColors
    : colors

  /* =======================================================
     VALIDATION STATE
     ======================================================= */

  const hasValue =
    value.trim().length > 0

  const isValid =
    touched &&
    hasValue &&
    !error

  const isInvalid =
    touched &&
    !!error

  /* =======================================================
     INPUT TYPE
     ======================================================= */

  const inputType =
    type === 'password'
      ? showPassword
        ? 'text'
        : 'password'
      : type

  /* =======================================================
     BORDER COLOR
     ======================================================= */

  const borderColor =
    isInvalid
      ? themeColors.red
      : isValid
        ? themeColors.green
        : focused
          ? themeColors.green
          : themeColors.border

  /* =======================================================
     BACKGROUND COLOR
     ======================================================= */

  const backgroundColor =
    isInvalid
      ? themeColors.redBackground
      : isValid
        ? themeColors.greenLight
        : themeColors.background

  return (
    <div className="mb-4">

      {/* ===================================================
          LABEL
          =================================================== */}

      <label
        htmlFor={name}
        className="mb-1.5 block text-[13px] font-semibold"
        style={{
          color: themeColors.charcoal,
        }}
      >
        {label}

        {required && (
          <span
            className="ml-1"
            style={{
              color: themeColors.red,
            }}
          >
            *
          </span>
        )}
      </label>

      {/* ===================================================
          INPUT CONTAINER
          =================================================== */}

      <div
        className="flex items-center rounded-[14px] border-[1.5px] transition-all duration-300 ease-in-out"
        style={{
          backgroundColor,
          borderColor,
        }}
      >

        {/* Input */}
        <input
          id={name}
          name={name}
          type={inputType}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          maxLength={maxLength}
          onChange={onChange}
          onFocus={() =>
            setFocused(true)
          }
          onBlur={() => {
            setFocused(false)
            onBlur?.()
          }}
          className="min-w-0 flex-1 bg-transparent px-4 py-[16px] text-[15px] outline-none placeholder:text-[#9CA3AF] disabled:cursor-not-allowed disabled:opacity-60"
          style={{
            color: themeColors.charcoal,
          }}
        />

        {/* =================================================
            PASSWORD TOGGLE
            ================================================= */}

        {type === 'password' && (
          <button
            type="button"
            onClick={() =>
              setShowPassword(
                (current) => !current,
              )
            }
            disabled={disabled}
            className="mr-4 flex shrink-0 items-center gap-1.5 text-[13px] font-medium transition-opacity duration-200 hover:opacity-70"
            style={{
              color: themeColors.mid,
            }}
          >
            {showPassword ? (
              <>
                <EyeOff
                  size={16}
                  strokeWidth={1.8}
                />

                <span>
                  Hide
                </span>
              </>
            ) : (
              <>
                <Eye
                  size={16}
                  strokeWidth={1.8}
                />

                <span>
                  Show
                </span>
              </>
            )}
          </button>
        )}

        {/* =================================================
            VALID ICON
            ================================================= */}

        {type !== 'password' &&
          isValid && (
            <Check
              size={18}
              strokeWidth={2.2}
              className="mr-4 shrink-0"
              style={{
                color:
                  themeColors.green,
              }}
            />
          )}

        {/* =================================================
            INVALID ICON
            ================================================= */}

        {type !== 'password' &&
          isInvalid && (
            <X
              size={18}
              strokeWidth={2.2}
              className="mr-4 shrink-0"
              style={{
                color:
                  themeColors.red,
              }}
            />
          )}

      </div>

      {/* ===================================================
          ERROR MESSAGE
          =================================================== */}

      {isInvalid && (
        <p
          className="mt-1.5 text-[12px] leading-[1.4]"
          style={{
            color: themeColors.red,
          }}
        >
          {error}
        </p>
      )}

    </div>
  )
}
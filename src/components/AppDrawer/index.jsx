import React from 'react';
import { Drawer } from 'vaul';
import {
  Box,
  IconButton,
  Typography,
  useMediaQuery,
  useTheme,
  alpha,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const SIZE_MAP = {
  sm: 400,
  md: 480,
  lg: 640,
  xl: 720,
};

/**
 * Vaul drawer: bottom sheet on mobile, side panel on md+ (RTL-aware).
 * Use `nested` when opening from inside another drawer (e.g. parent form inside student drawer).
 */
export default function AppDrawer({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = 'lg',
  nested = false,
  showHandle = true,
  className,
  contentClassName,
}) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const isRtl = theme.direction === 'rtl';
  const direction = isDesktop ? (isRtl ? 'left' : 'right') : 'bottom';

  const handleOpenChange = (v) => {
    if (!v) onClose();
  };

  const maxW = SIZE_MAP[size] ?? SIZE_MAP.lg;
  /**
   * Stack above layout: AppBar uses zIndex.drawer+1 (~1201), MUI Drawer paper ~1200.
   * Modal (1300) can still lose to odd stacking contexts; use tooltip tier so overlay + panel
   * sit above chrome. Nested inner drawers step slightly higher.
   */
  const zBump = nested ? 30 : 0;
  const zOverlay = theme.zIndex.tooltip - 1 + zBump;
  const zContent = theme.zIndex.tooltip + zBump;

  const panelBg = theme.palette.background.paper;
  const borderSide = isRtl ? 'borderRight' : 'borderLeft';

  const contentSx =
    direction === 'bottom'
      ? {
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: zContent,
          display: 'flex',
          flexDirection: 'column',
          maxHeight: 'min(92dvh, 100%)',
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          backgroundColor: panelBg,
          boxShadow: theme.shadows[24],
          borderTop: `1px solid ${theme.palette.divider}`,
          outline: 'none',
        }
      : {
          position: 'fixed',
          top: 0,
          bottom: 0,
          [isRtl ? 'left' : 'right']: 0,
          zIndex: zContent,
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          maxWidth: maxW,
          height: '100%',
          maxHeight: '100dvh',
          backgroundColor: panelBg,
          boxShadow: theme.shadows[24],
          [borderSide]: `1px solid ${theme.palette.divider}`,
          outline: 'none',
        };

  return (
    <Drawer.Root
      open={open}
      onOpenChange={handleOpenChange}
      direction={direction}
      nested={nested}
      modal
      shouldScaleBackground={false}
    >
      <Drawer.Portal>
        <Drawer.Overlay
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: zOverlay,
            backgroundColor: alpha(theme.palette.common.black, 0.48),
          }}
        />
        <Drawer.Content
          className={contentClassName}
          style={contentSx}
        >
          <Box
            className={className}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              minHeight: 0,
              width: 1,
            }}
          >
            {direction === 'bottom' && showHandle && (
              <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1.25, pb: 0.5 }}>
                <Drawer.Handle
                  style={{
                    width: 40,
                    height: 4,
                    borderRadius: 999,
                    backgroundColor: alpha(theme.palette.text.primary, 0.15),
                  }}
                />
              </Box>
            )}

            <Box
              sx={{
                px: 2.5,
                pt: direction === 'bottom' ? 0.5 : 2,
                pb: 1.5,
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: 1.5,
                borderBottom: 1,
                borderColor: 'divider',
                flexShrink: 0,
                bgcolor: alpha(theme.palette.primary.main, 0.04),
              }}
            >
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Drawer.Title asChild>
                  <Typography variant="h6" component="h2" fontWeight={800} sx={{ lineHeight: 1.3 }}>
                    {title}
                  </Typography>
                </Drawer.Title>
                {subtitle ? (
                  <Drawer.Description asChild>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {subtitle}
                    </Typography>
                  </Drawer.Description>
                ) : (
                  <Drawer.Description className="sr-only">Form</Drawer.Description>
                )}
              </Box>
              <IconButton
                onClick={onClose}
                size="small"
                aria-label="close"
                sx={{
                  mt: -0.5,
                  color: 'text.secondary',
                  '&:hover': { bgcolor: alpha(theme.palette.text.primary, 0.06) },
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>

            <Box
              sx={{
                flex: 1,
                overflowY: 'auto',
                overflowX: 'hidden',
                px: 2.5,
                py: 2.5,
                WebkitOverflowScrolling: 'touch',
              }}
            >
              {children}
            </Box>

            {footer ? (
              <Box
                sx={{
                  px: 2.5,
                  py: 2,
                  borderTop: 1,
                  borderColor: 'divider',
                  flexShrink: 0,
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 1.5,
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  bgcolor: alpha(theme.palette.primary.main, 0.03),
                }}
              >
                {footer}
              </Box>
            ) : null}
          </Box>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

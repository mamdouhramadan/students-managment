import React from 'react';
import {
  Box,
  Button,
  Chip,
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  alpha,
} from '@mui/material';
import BusinessOutlined from '@mui/icons-material/BusinessOutlined';
import EmailOutlined from '@mui/icons-material/EmailOutlined';
import EventNoteOutlined from '@mui/icons-material/EventNoteOutlined';
import PaletteOutlined from '@mui/icons-material/PaletteOutlined';
import SaveOutlined from '@mui/icons-material/SaveOutlined';
import RestartAltOutlined from '@mui/icons-material/RestartAltOutlined';
import ContentCopyOutlined from '@mui/icons-material/ContentCopyOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import MuiHexColorPicker from '../../components/MuiHexColorPicker';
import PageHeader from '../../components/PageHeader';
import ShowToast from '../../components/ShowToast';
import { useSiteSettings, useStudentTags } from '../../hooks/siteSettings';
import { useLanguage } from '../../providers/LanguageProvider';
import { ALL_DAY_IDS, parseWeekendDays } from '../../utils/timetableCalendar';

const DEMO_DB_RELATIVE_PATH = 'server/db.json';

function TabPanel({ children, value, index, idPrefix }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`${idPrefix}-panel-${index}`}
      aria-labelledby={`${idPrefix}-tab-${index}`}
    >
      {value === index && <Box sx={{ py: { xs: 2, sm: 2.5 } }}>{children}</Box>}
    </div>
  );
}

function sectionTitle(t, titleKey, hintKey) {
  return (
    <Stack spacing={0.5} sx={{ mb: 2 }}>
      <Typography variant="subtitle1" fontWeight={700} color="text.primary">
        {t(titleKey)}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 640 }}>
        {t(hintKey)}
      </Typography>
    </Stack>
  );
}

const SiteSettingsPage = () => {
  const { t } = useLanguage();
  const {
    colorValid,
    form,
    handleChange,
    handleSave,
    handleSelect,
    handleTabChange,
    loading,
    preference,
    resetAllAndSave,
    resetEmailSettings,
    resetGeneralSettings,
    resetScheduleSettings,
    resetThemeSettings,
    saving,
    setForm,
    setPreferenceMode,
    tabIndex,
    tabPrefix,
    toggleWeekendDay,
  } = useSiteSettings();
  const {
    handleAddTag,
    handleDeleteTag,
    newTagName,
    setNewTagName,
    studentTagsList,
  } = useStudentTags();

  if (loading) {
    return (
      <Box sx={{ width: 1, maxWidth: 960 }}>
        <PageHeader title={t('settings.title')} subtitle={t('settings.subtitle')} />
        <Typography color="text.secondary" variant="body2" sx={{ mt: 2 }}>
          {t('settings.loading')}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: 1, maxWidth: 1260, mx: 'auto' }}>
      <PageHeader title={t('settings.title')} subtitle={t('settings.subtitle')} />

      <Paper
        elevation={0}
        sx={{
          mt: 2,
          borderRadius: 2,
          border: 1,
          borderColor: 'divider',
          overflow: 'hidden',
          bgcolor: 'background.paper',
          boxShadow: (th) => `0 1px 3px ${alpha(th.palette.common.black, 0.06)}`,
        }}
      >
        <Box
          sx={{
            // px: { xs: 1.5, sm: 2 },
            // pt: { xs: 1.5, sm: 2 },
            background: (th) =>
              `linear-gradient(180deg, ${alpha(th.palette.primary.main, 0.06)} 0%, transparent 100%)`,
          }}
        >
          <Tabs
            value={tabIndex}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              minHeight: 48,
              '& .MuiTab-root': {
                minHeight: 48,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.95rem',
              },
            }}
          >
            <Tab
              icon={<BusinessOutlined sx={{ fontSize: 20 }} />}
              iconPosition="start"
              label={t('settings.tabGeneral')}
              id={`${tabPrefix}-tab-0`}
              aria-controls={`${tabPrefix}-panel-0`}
            />
            <Tab
              icon={<EmailOutlined sx={{ fontSize: 20 }} />}
              iconPosition="start"
              label={t('settings.tabEmail')}
              id={`${tabPrefix}-tab-1`}
              aria-controls={`${tabPrefix}-panel-1`}
            />
            <Tab
              icon={<PaletteOutlined sx={{ fontSize: 20 }} />}
              iconPosition="start"
              label={t('settings.tabTheme')}
              id={`${tabPrefix}-tab-2`}
              aria-controls={`${tabPrefix}-panel-2`}
            />
            <Tab
              icon={<EventNoteOutlined sx={{ fontSize: 20 }} />}
              iconPosition="start"
              label={t('settings.tabSchedule')}
              id={`${tabPrefix}-tab-3`}
              aria-controls={`${tabPrefix}-panel-3`}
            />
          </Tabs>
        </Box>

        <Divider />

        <Box sx={{ px: { xs: 2, sm: 3 }, pb: 0 }}>
          <TabPanel value={tabIndex} index={0} idPrefix={tabPrefix}>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                mb: 3,
                bgcolor: (theme) => theme.palette.mode === 'dark' ? 'action.hover' : 'grey.50',
                borderColor: 'divider',
              }}
            >
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                {t('settings.backupDbTitle')}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxWidth: 720 }}>
                {t('settings.backupDbBody')}
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
                <TextField
                  size="small"
                  label={t('settings.backupDbPathLabel')}
                  value={DEMO_DB_RELATIVE_PATH}
                  fullWidth
                  InputProps={{ readOnly: true }}
                />
                <Button
                  variant="outlined"
                  startIcon={<ContentCopyOutlined />}
                  onClick={() => {
                    navigator.clipboard
                      .writeText(DEMO_DB_RELATIVE_PATH)
                      .then(() => ShowToast('success', t('settings.backupDbCopied')))
                      .catch(() => ShowToast('error', t('settings.saveError')));
                  }}
                  sx={{ flexShrink: 0 }}
                >
                  {t('settings.backupDbCopyPath')}
                </Button>
              </Stack>
            </Paper>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                mb: 3,
                bgcolor: 'background.paper',
                borderColor: 'divider',
              }}
            >
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                {t('settings.sectionTags')}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxWidth: 720 }}>
                {t('settings.sectionTagsHint')}
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 2 }} alignItems={{ sm: 'flex-start' }}>
                <TextField
                  size="small"
                  label={t('settings.tagNamePlaceholder')}
                  value={newTagName}
                  onChange={(event) => setNewTagName(event.target.value)}
                  fullWidth
                />
                <Button
                  variant="contained"
                  onClick={handleAddTag}
                  sx={{ flexShrink: 0 }}
                >
                  {t('settings.tagAdd')}
                </Button>
              </Stack>
              <Stack direction="row" gap={1} flexWrap="wrap" useFlexGap>
                {studentTagsList.map((tagRow) => (
                  <Chip
                    key={tagRow.id}
                    label={tagRow.name}
                    onDelete={() => handleDeleteTag(tagRow.id)}
                    deleteIcon={<DeleteOutlineIcon />}
                  />
                ))}
              </Stack>
            </Paper>
            {sectionTitle(t, 'settings.sectionGeneral', 'settings.sectionGeneralHint')}
            <Grid container spacing={2.5}>
              <Grid item xs={12}>
                <TextField
                  label={t('settings.schoolName')}
                  value={form.schoolName}
                  onChange={handleChange('schoolName')}
                  fullWidth
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label={t('settings.schoolTagline')}
                  value={form.schoolTagline}
                  onChange={handleChange('schoolTagline')}
                  fullWidth
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label={t('settings.supportPhone')}
                  value={form.supportPhone}
                  onChange={handleChange('supportPhone')}
                  fullWidth
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label={t('settings.academicYear')}
                  value={form.academicYear}
                  onChange={handleChange('academicYear')}
                  fullWidth
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label={t('settings.timezone')}
                  value={form.timezone}
                  onChange={handleChange('timezone')}
                  fullWidth
                  variant="outlined"
                  placeholder="Asia/Dubai"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label={t('settings.announcement')}
                  value={form.announcement}
                  onChange={handleChange('announcement')}
                  fullWidth
                  variant="outlined"
                  multiline
                  minRows={4}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 2 }} alignItems={{ sm: 'center' }}>
              <Button
                variant="outlined"
                color="warning"
                startIcon={<RestartAltOutlined />}
                disabled={saving}
                onClick={resetGeneralSettings}
              >
                {t('settings.resetSectionGeneral')}
              </Button>
              <Typography variant="caption" color="text.secondary" sx={{ maxWidth: 480 }}>
                {t('settings.resetSectionGeneralHint')}
              </Typography>
            </Stack>
          </TabPanel>

          <TabPanel value={tabIndex} index={1} idPrefix={tabPrefix}>
            {sectionTitle(t, 'settings.sectionEmailPublic', 'settings.sectionEmailPublicHint')}
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label={t('settings.contactEmail')}
                  type="email"
                  value={form.contactEmail}
                  onChange={handleChange('contactEmail')}
                  fullWidth
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label={t('settings.admissionsEmail')}
                  type="email"
                  value={form.admissionsEmail}
                  onChange={handleChange('admissionsEmail')}
                  fullWidth
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {sectionTitle(t, 'settings.sectionEmailSmtp', 'settings.sectionEmailSmtpHint')}
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={8}>
                <TextField
                  label={t('settings.smtpHost')}
                  value={form.smtpHost}
                  onChange={handleChange('smtpHost')}
                  fullWidth
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label={t('settings.smtpPort')}
                  value={form.smtpPort}
                  onChange={handleChange('smtpPort')}
                  fullWidth
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="smtp-secure-label">{t('settings.smtpSecure')}</InputLabel>
                  <Select
                    labelId="smtp-secure-label"
                    label={t('settings.smtpSecure')}
                    value={form.smtpSecure}
                    onChange={handleSelect('smtpSecure')}
                  >
                    <MenuItem value="true">{t('settings.smtpSecureYes')}</MenuItem>
                    <MenuItem value="false">{t('settings.smtpSecureNo')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label={t('settings.smtpUser')}
                  value={form.smtpUser}
                  onChange={handleChange('smtpUser')}
                  fullWidth
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label={t('settings.emailFromName')}
                  value={form.emailFromName}
                  onChange={handleChange('emailFromName')}
                  fullWidth
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label={t('settings.emailFromAddress')}
                  type="email"
                  value={form.emailFromAddress}
                  onChange={handleChange('emailFromAddress')}
                  fullWidth
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label={t('settings.emailReplyTo')}
                  type="email"
                  value={form.emailReplyTo}
                  onChange={handleChange('emailReplyTo')}
                  fullWidth
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label={t('settings.emailSignature')}
                  value={form.emailSignature}
                  onChange={handleChange('emailSignature')}
                  fullWidth
                  variant="outlined"
                  multiline
                  minRows={3}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 2 }} alignItems={{ sm: 'center' }}>
              <Button
                variant="outlined"
                color="warning"
                startIcon={<RestartAltOutlined />}
                disabled={saving}
                onClick={resetEmailSettings}
              >
                {t('settings.resetSectionEmail')}
              </Button>
              <Typography variant="caption" color="text.secondary" sx={{ maxWidth: 480 }}>
                {t('settings.resetSectionEmailHint')}
              </Typography>
            </Stack>
          </TabPanel>

          <TabPanel value={tabIndex} index={2} idPrefix={tabPrefix}>
            {sectionTitle(t, 'settings.appAppearanceTitle', 'settings.appAppearanceHint')}
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1.5 }}>
              {t('settings.themeMode')}:{' '}
              {preference === 'system'
                ? t('settings.themeModeSystem')
                : preference === 'dark'
                  ? t('settings.themeModeDark')
                  : t('settings.themeModeLight')}
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 3 }}>
              <Button
                variant={preference === 'system' ? 'contained' : 'outlined'}
                size="small"
                onClick={() => setPreferenceMode('system')}
              >
                {t('settings.useSystemAppearance')}
              </Button>
              <Button
                variant={preference === 'light' ? 'contained' : 'outlined'}
                size="small"
                onClick={() => setPreferenceMode('light')}
              >
                {t('settings.useLightAppearance')}
              </Button>
              <Button
                variant={preference === 'dark' ? 'contained' : 'outlined'}
                size="small"
                onClick={() => setPreferenceMode('dark')}
              >
                {t('settings.useDarkAppearance')}
              </Button>
            </Stack>

            <Divider sx={{ mb: 3 }} />

            {sectionTitle(t, 'settings.sectionThemeLook', 'settings.sectionThemeLookHint')}
            <Grid container spacing={2.5} alignItems="flex-start">
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="density-label">{t('settings.density')}</InputLabel>
                  <Select
                    labelId="density-label"
                    label={t('settings.density')}
                    value={form.density}
                    onChange={handleSelect('density')}
                  >
                    <MenuItem value="default">{t('settings.densityDefault')}</MenuItem>
                    <MenuItem value="comfortable">{t('settings.densityComfortable')}</MenuItem>
                    <MenuItem value="compact">{t('settings.densityCompact')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <MuiHexColorPicker
                  label={t('settings.primaryColorHex')}
                  value={form.primaryColorHex}
                  onChange={(hex) => setForm((prev) => ({ ...prev, primaryColorHex: hex }))}
                  error={Boolean(form.primaryColorHex) && !colorValid}
                  helperText={
                    form.primaryColorHex && !colorValid ? t('settings.invalidHex') : ' '
                  }
                />
              </Grid>
            </Grid>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 2 }} alignItems={{ sm: 'center' }}>
              <Button
                variant="outlined"
                color="warning"
                startIcon={<RestartAltOutlined />}
                disabled={saving}
                onClick={resetThemeSettings}
              >
                {t('settings.resetSectionTheme')}
              </Button>
              <Typography variant="caption" color="text.secondary" sx={{ maxWidth: 480 }}>
                {t('settings.resetSectionThemeHint')}
              </Typography>
            </Stack>
          </TabPanel>

          <TabPanel value={tabIndex} index={3} idPrefix={tabPrefix}>
            {sectionTitle(t, 'settings.sectionSchedule', 'settings.sectionScheduleHint')}
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="week-start-label">{t('settings.timetableWeekStartDay')}</InputLabel>
                  <Select
                    labelId="week-start-label"
                    label={t('settings.timetableWeekStartDay')}
                    value={form.timetableWeekStartDay || 'sun'}
                    onChange={handleSelect('timetableWeekStartDay')}
                  >
                    {ALL_DAY_IDS.map((id) => (
                      <MenuItem key={id} value={id}>
                        {t(`timetablePage.day.${id}`)}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>{t('settings.timetableWeekStartDayHelper')}</FormHelperText>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {t('settings.timetableWeekendDays')}
                </Typography>
                <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1} sx={{ mb: 0.5 }}>
                  {ALL_DAY_IDS.map((id) => {
                    const selected = parseWeekendDays(form.timetableWeekendDays).includes(id);
                    return (
                      <Chip
                        key={id}
                        label={t(`timetablePage.day.${id}`)}
                        color={selected ? 'primary' : 'default'}
                        variant={selected ? 'filled' : 'outlined'}
                        onClick={() => toggleWeekendDay(id)}
                      />
                    );
                  })}
                </Stack>
                <Typography variant="caption" color="text.secondary" display="block">
                  {t('settings.timetableWeekendDaysHelper')}
                </Typography>
              </Grid>
            </Grid>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 2 }} alignItems={{ sm: 'center' }}>
              <Button
                variant="outlined"
                color="warning"
                startIcon={<RestartAltOutlined />}
                disabled={saving}
                onClick={resetScheduleSettings}
              >
                {t('settings.resetSectionSchedule')}
              </Button>
              <Typography variant="caption" color="text.secondary" sx={{ maxWidth: 480 }}>
                {t('settings.resetSectionScheduleHint')}
              </Typography>
            </Stack>
          </TabPanel>
        </Box>

        <Divider />

        <Box
          sx={{
            px: { xs: 2, sm: 3 },
            py: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
            flexWrap: 'wrap',
            bgcolor: (th) => alpha(th.palette.primary.main, 0.04),
          }}
        >
          <Stack spacing={0.5} sx={{ flex: '1 1 220px' }}>
            <Typography variant="caption" color="text.secondary">
              {t('settings.saveFooterHint')}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t('settings.resetAllHint')}
            </Typography>
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="stretch">
            <Button
              variant="outlined"
              color="warning"
              startIcon={<RestartAltOutlined />}
              onClick={resetAllAndSave}
              disabled={saving}
              sx={{ borderRadius: 2 }}
            >
              {t('settings.resetAll')}
            </Button>
            <Button
              variant="contained"
              size="large"
              startIcon={<SaveOutlined />}
              onClick={handleSave}
              disabled={saving}
              sx={{ minWidth: 160, borderRadius: 2 }}
            >
              {saving ? t('settings.saving') : t('settings.save')}
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
};

export default SiteSettingsPage;

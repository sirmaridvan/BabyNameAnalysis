import React, { useState } from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Container,
  IconButton,
  TextField,
  Button,
  Paper,
  Card,
  CardContent,
  CardHeader,
  Stack,
  Divider,
  useMediaQuery,
  Link as MuiLink
} from '@mui/material';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';

const NameAnalyticsPlaceholder: React.FC<{ name: string }> = ({ name }) => {
  const items = [
    { title: 'Popülerlik', value: 'Orta', desc: 'Yakın yıllarda dengeli kullanım.' },
    { title: 'Köken', value: 'Türkçe / Arapça', desc: 'Çoklu kökene sahip olabilir.' },
    { title: 'Anlam', value: '“Güç / Bilgelik”', desc: 'Temsili örnek anlam.' },
    { title: 'Cinsiyet', value: 'Uniseks', desc: 'Farklı bölgelerde değişebilir.' },
    { title: 'Zirve Yıl', value: '2018', desc: 'Örnek veri.' },
    { title: 'Ortalama Kullanım', value: '~ 1.240', desc: 'Temsili değer.' }
  ];
  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardHeader title="İsim Analitiği" subheader={name ? `“${name}” için tahmini bilgiler` : 'Henüz bir isim girilmedi'} />
      <CardContent>
        <Box sx={{
          display:'grid',
            gap:2,
            gridTemplateColumns:{ xs:'1fr', sm:'repeat(2,1fr)', md:'repeat(3,1fr)' }
        }}>
          {items.map(it => (
            <Paper key={it.title} variant="outlined" sx={{ p:2, display:'flex', flexDirection:'column', gap:0.5 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>{it.title}</Typography>
              <Typography variant="h6">{it.value}</Typography>
              <Typography variant="body2" color="text.secondary">{it.desc}</Typography>
            </Paper>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

const AICommentPlaceholder: React.FC<{ name: string }> = ({ name }) => (
  <Card variant="outlined" sx={{ height: '100%', display:'flex', flexDirection:'column' }}>
    <CardHeader title="Yapay Zeka Yorumu" subheader={name ? `“${name}” için oluşturulmuş değerlendirme` : 'İsim girildiğinde yorum görünecek'} />
    <CardContent sx={{ flexGrow:1 }}>
      <Typography variant="body2" sx={{ whiteSpace:'pre-line' }} color="text.secondary">
        {name ? `“${name}” ismi tarihsel olarak farklı kültürlerde çeşitli anlam katmanlarıyla ele alınmıştır. Bu alan dinamik veri ile güncellenecek.` : 'Burada yapay zeka tarafından üretilen açıklama yer alacak.'}
      </Typography>
    </CardContent>
  </Card>
);

const MuiLayout: React.FC = () => {
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
  const [mode, setMode] = useState<'light' | 'dark'>(prefersDark ? 'dark' : 'light');
  const [name, setName] = useState('');

  const theme = React.useMemo(() => createTheme({
    palette: { mode, primary: { main: mode === 'light' ? '#3949ab' : '#818cf8' }, background: { default: mode === 'light' ? '#f5f7fb' : '#0f172a', paper: mode === 'light' ? '#ffffff' : '#1e293b' } },
    shape: { borderRadius: 14 },
    typography: { fontFamily: 'Inter, system-ui, Roboto, Helvetica, Arial, sans-serif', h1: { fontSize: 'clamp(1.9rem,2.4vw,2.6rem)', fontWeight: 600 } },
    components: {
      MuiCard: { styleOverrides: { root: { borderWidth:1, borderStyle:'solid', borderColor: mode==='light'?'#e2e8f0':'#334155' } } },
      MuiPaper: { styleOverrides: { root: { borderRadius: 12 } } },
      MuiAppBar: { styleOverrides: { root: { backdropFilter: 'blur(12px)' } } }
    }
  }), [mode]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // placeholder submit
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="sticky" color="transparent" elevation={0} sx={{ borderBottom: 1, borderColor: mode==='light'? 'divider' : '#334155', background: mode==='light' ? 'rgba(255,255,255,0.75)' : 'rgba(15,23,42,0.75)' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow:1, fontWeight:700, letterSpacing:0.5 }}>Name Analyzer</Typography>
          <IconButton color="inherit" onClick={() => setMode(m => m==='light'?'dark':'light')}>
            {mode==='light'? <DarkModeIcon /> : <LightModeIcon />}
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box component="main" sx={{ py: { xs:4, md:6 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign:'center', mb:5 }}>
            <Typography variant="h1" gutterBottom>İsim Analiz Platformu</Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth:760, mx:'auto', fontWeight:400 }}>İsimlerin kökeni, anlamı ve kullanım eğilimleri hakkında modern ve zengin bir arayüz.</Typography>
          </Box>
          <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth:520, mx:'auto', display:'flex', gap:2, flexWrap:'wrap', mb:6 }}>
            <TextField fullWidth label="İsim" placeholder="Örn. Mehmet" value={name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)} />
            <Button variant="contained" type="submit" disabled={!name} sx={{ px:4, flexShrink:0 }}>Analiz Et</Button>
          </Box>
          <Box sx={{ display:'grid', gap:3, gridTemplateColumns:{ xs:'1fr', md:'2fr 1fr' } }}>
            <Box>
              <NameAnalyticsPlaceholder name={name} />
            </Box>
            <Box>
              <Stack spacing={3} sx={{ height:'100%' }}>
                <AICommentPlaceholder name={name} />
                <Paper variant="outlined" sx={{ p:2 }}>
                  <Typography variant="subtitle2" gutterBottom fontWeight={600}>Ek Kaynaklar</Typography>
                  <Typography variant="body2" color="text.secondary">Yakında: Eğilim grafikleri, coğrafi dağılım ve daha fazlası.</Typography>
                </Paper>
              </Stack>
            </Box>
          </Box>
        </Container>
      </Box>
      <Divider />
      <Box component="footer" sx={{ py:3 }}>
        <Container maxWidth="lg" sx={{ display:'flex', flexDirection:{ xs:'column', sm:'row' }, gap:2, alignItems:{ xs:'flex-start', sm:'center' }, justifyContent:'space-between' }}>
          <Typography variant="caption" color="text.secondary">© {new Date().getFullYear()} Name Analyzer</Typography>
          <Stack direction="row" spacing={3}>
            <MuiLink href="#" underline="hover" color="text.secondary" variant="caption">Gizlilik</MuiLink>
            <MuiLink href="#" underline="hover" color="text.secondary" variant="caption">Koşullar</MuiLink>
            <MuiLink href="#" underline="hover" color="text.secondary" variant="caption">İletişim</MuiLink>
          </Stack>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default MuiLayout;

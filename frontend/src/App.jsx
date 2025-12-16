import { useState } from 'react';
import axios from 'axios';
import { 
  AppShell, Burger, Group, Title, Button, NumberInput, 
  Select, Paper, Text, Grid, Container, Alert, Loader, Stack 
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconAlertCircle, IconCheck, IconShieldLock } from '@tabler/icons-react';

export default function App() {
  const [opened, { toggle }] = useDisclosure();
  
  // State to store the form inputs
  const [amount, setAmount] = useState(1000);
  const [oldOrg, setOldOrg] = useState(1000);
  const [newOrg, setNewOrg] = useState(0);
  const [oldDest, setOldDest] = useState(0);
  const [newDest, setNewDest] = useState(0);
  const [model, setModel] = useState('XGB'); // Default to the smart XGBoost model

  // State for the result
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // The function that calls your Python Backend
  const handleCheckFraud = async () => {
    setLoading(true);
    setResult(null);
    try {
      // This URL must match your FastAPI address
      const response = await axios.post('http://127.0.0.1:8000/predict?model_type=' + model, {
        amount: parseFloat(amount),
        oldbalanceOrg: parseFloat(oldOrg),
        newbalanceOrig: parseFloat(newOrg),
        oldbalanceDest: parseFloat(oldDest),
        newbalanceDest: parseFloat(newDest)
      });
      setResult(response.data);
    } catch (error) {
      console.error("Error connecting to backend:", error);
      alert("Error: Is your Python backend running?");
    }
    setLoading(false);
  };

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <IconShieldLock size={30} color="blue" />
          <Title order={3}>FraudSentry Admin</Title>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Stack>
          <Button variant="light" color="blue" fullWidth justify="flex-start">Dashboard</Button>
          <Button variant="subtle" color="gray" fullWidth justify="flex-start">Transaction History</Button>
          <Button variant="subtle" color="gray" fullWidth justify="flex-start">Settings</Button>
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>
        <Container size="lg">
          <Title order={2} mb="lg">Live Transaction Analysis</Title>
          
          <Grid>
            {/* LEFT COLUMN: The Input Form */}
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Paper shadow="xs" p="xl" withBorder>
                <Title order={4} mb="md">Simulate Transaction</Title>
                <Stack>
                  <Select 
                    label="AI Model" 
                    value={model} 
                    onChange={setModel}
                    data={[
                      { value: 'RF', label: 'Random Forest (Conservative)' },
                      { value: 'XGB', label: 'XGBoost (High Sensitivity)' }
                    ]}
                  />
                  <NumberInput label="Transaction Amount ($)" value={amount} onChange={setAmount} />
                  <NumberInput label="Sender Old Balance" value={oldOrg} onChange={setOldOrg} />
                  <NumberInput label="Sender New Balance" value={newOrg} onChange={setNewOrg} />
                  <Button onClick={handleCheckFraud} loading={loading} fullWidth mt="md" size="md">
                    Analyze Risk
                  </Button>
                </Stack>
              </Paper>
            </Grid.Col>

            {/* RIGHT COLUMN: The Results */}
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Paper shadow="xs" p="xl" h="100%" withBorder style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {!result && !loading && <Text c="dimmed">Enter transaction details to see AI prediction.</Text>}
                
                {loading && <Loader type="dots" />}

                {result && (
                  <Stack align="center" style={{ width: '100%' }}>
                    {result.is_fraud === 1 ? (
                      <Alert variant="filled" color="red" title="FRAUD DETECTED" icon={<IconAlertCircle />}>
                        This transaction is highly suspicious!
                      </Alert>
                    ) : (
                      <Alert variant="filled" color="green" title="Transaction Safe" icon={<IconCheck />}>
                        No risk factors identified.
                      </Alert>
                    )}

                    <Group mt="md">
                      <Paper p="md" withBorder>
                        <Text size="xs" c="dimmed">Risk Score</Text>
                        <Title order={2}>{(result.risk_score * 100).toFixed(1)}%</Title>
                      </Paper>
                      <Paper p="md" withBorder>
                        <Text size="xs" c="dimmed">Model Used</Text>
                        <Title order={2}>{result.model_used}</Title>
                      </Paper>
                    </Group>
                    {/* --- PASTE THIS BLOCK --- */}
                    {/* NEW: Gemini AI Analysis Box */}
                    {result.ai_analysis && result.is_fraud === 1 && (
                      <Alert variant="light" color="blue" title="Gemini AI Analysis" icon={<IconShieldLock />} mb="md">
                        <Text size="sm">{result.ai_analysis}</Text>
                      </Alert>
                    )}
                    {/* ------------------------ */}
                    {/* NEW: Explainability Section */}
                    {result.explanation && (
                      <Paper p="md" mt="md" withBorder style={{ width: '100%' }}>
                        <Title order={4} mb="sm">Why is this suspicious?</Title>
                        <Stack gap="xs">
                          {result.explanation.map((factor, index) => (
                            <Group key={index} justify="space-between">
                              <Text size="sm">{factor.feature}</Text>
                              <Text 
                                size="sm" 
                                fw={700} 
                                c={factor.impact > 0 ? "red" : "green"}
                              >
                                {factor.impact > 0 ? "+" : ""}{factor.impact.toFixed(2)} impact
                              </Text>
                            </Group>
                          ))}
                        </Stack>
                      </Paper>
                    )}
                  </Stack>
                )}
              </Paper>
            </Grid.Col>
          </Grid>
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
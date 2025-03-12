// App.js
const { useState, useEffect } = React;

const App = () => {
  // State for the Health Helper component
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [smokingStatus, setSmokingStatus] = useState('');
  const [alcoholConsumption, setAlcoholConsumption] = useState('');
  const [physicalActivity, setPhysicalActivity] = useState('');
  const [recommendations, setRecommendations] = useState(null);
  const [fitnessRecommendations, setFitnessRecommendations] = useState(null);
  const [showForm, setShowForm] = useState(true);
  const [healthData, setHealthData] = useState({
    baseRecommendations: [],
    ageSpecificRecommendations: {},
    fitnessRecommendations: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // GitHub-hosted CSV file URLs (assuming they're in the same repository)
  const baseRecommendationsUrl = "base-recs.csv";
  const ageSpecificRecommendationsUrl = "age-specific-recs.csv";
  const fitnessRecommendationsUrl = "physical-fitness-recs.csv";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Try to fetch the data from local CSV files
        try {
          // Fetch base recommendations
          const baseResponse = await fetch(baseRecommendationsUrl);
          if (!baseResponse.ok) throw new Error(`Failed to fetch base recommendations (${baseResponse.status})`);
          const baseText = await baseResponse.text();
          
          // Fetch age-specific recommendations
          const ageSpecificResponse = await fetch(ageSpecificRecommendationsUrl);
          if (!ageSpecificResponse.ok) throw new Error(`Failed to fetch age-specific recommendations (${ageSpecificResponse.status})`);
          const ageSpecificText = await ageSpecificResponse.text();
          
          // Fetch fitness recommendations
          const fitnessResponse = await fetch(fitnessRecommendationsUrl);
          if (!fitnessResponse.ok) throw new Error(`Failed to fetch fitness recommendations (${fitnessResponse.status})`);
          const fitnessText = await fitnessResponse.text();
          
          console.log("Successfully fetched all CSV files");
          
          // Parse CSV data
          const baseResults = Papa.parse(baseText, {
            header: true,
            skipEmptyLines: true
          });
          
          const ageSpecificResults = Papa.parse(ageSpecificText, {
            header: true,
            skipEmptyLines: true
          });
          
          const fitnessResults = Papa.parse(fitnessText, {
            header: true,
            skipEmptyLines: true
          });
          
          console.log("Base recommendations parsed:", baseResults.data.length, "records");
          console.log("Age-specific recommendations parsed:", ageSpecificResults.data.length, "records");
          console.log("Fitness recommendations parsed:", fitnessResults.data.length, "records");
          
          // Process age-specific data
          const ageSpecificRecs = {};
          ageSpecificResults.data.forEach(row => {
            if (!ageSpecificRecs[row.ageGroup]) {
              ageSpecificRecs[row.ageGroup] = {
                all: [],
                female: [],
                male: []
              };
            }
            
            const test = {
              test: row.test,
              frequency: row.frequency,
              notes: row.notes,
              riskFactors: row.riskFactors ? row.riskFactors.split(', ') : ['all']
            };
            
            if (row.gender === 'all') {
              ageSpecificRecs[row.ageGroup].all.push(test);
            } else {
              ageSpecificRecs[row.ageGroup][row.gender].push(test);
            }
          });
          
          setHealthData({
            baseRecommendations: baseResults.data.map(item => ({
              ...item,
              riskFactors: item.riskFactors ? item.riskFactors.split(', ') : ['all']
            })),
            ageSpecificRecommendations: ageSpecificRecs,
            fitnessRecommendations: fitnessResults.data.map(item => ({
              ...item,
              riskFactors: item.riskFactors ? item.riskFactors.split(', ') : ['all']
            }))
          });
          
          setLoading(false);
          return; // Exit if Google Sheets fetch worked
        } catch (err) {
          console.error("Error fetching from Google Sheets, falling back to mock data:", err);
          // Fall back to mock data if Google Sheets fetch fails
        }
        
        // If Google Sheets fetch failed, use mock data as fallback
        console.log("Using mock data");
        const mockBaseData = `test,frequency,notes,riskFactors
Annual physical exam,Yearly,General health assessment,all
Blood pressure screening,At least yearly,More frequently if borderline or elevated,all
Cholesterol screening,Every 4-6 years,More frequently if risk factors present,all
Depression screening,As needed,Discuss mental health with healthcare provider,all
Dental exam,Every 6 months,Preventive dental care,all
Eye exam,Every 2-3 years (under 40) or Yearly (40+),Vision and eye health,all
Skin check,Yearly,Self-exam monthly professional exam yearly,all
Liver function tests,Yearly,To monitor liver health,"smoker, heavyDrinker"
Lung function tests,Yearly,Spirometry and other breathing tests,smoker
Nutrition counseling,Yearly,Dietary recommendations and guidance,sedentary
Exercise consultation,Yearly,Personalized activity recommendations,sedentary
Heart health assessment,Yearly,Additional cardiovascular screening,"smoker, heavyDrinker, sedentary"`;

        // Mock data for age-specific recommendations
        const mockAgeSpecificData = `ageGroup,gender,test,frequency,notes,riskFactors
18-39,all,Diabetes screening,If BMI > 25 or risk factors,Every 3 years if normal,all
18-39,all,HPV vaccine,If not received,Recommended through age 26,all
18-39,female,Pap smear,Every 3 years,Starting at 21,all
18-39,female,Breast exam,Clinical exam every 1-3 years,Self-exam monthly,all
18-39,all,Lung cancer risk assessment,Yearly,Early screening recommendations,smoker
18-39,all,Alcohol use disorder screening,Yearly,To identify early signs of dependency,heavyDrinker
18-39,all,Cardiovascular health assessment,Every 2 years,Including ECG,"smoker, heavyDrinker, sedentary"
40-49,all,Diabetes screening,Every 3 years,More frequently with risk factors,all
40-49,female,Pap smear,Every 3 years,Or HPV co-testing every 5 years,all
40-49,female,Mammogram,Discuss with doctor,Based on personal risk factors,all
40-49,female,Breast exam,Clinical exam yearly,Self-exam monthly,all
40-49,male,Prostate cancer discussion,Consult doctor,If family history or African American,all
40-49,all,Lung cancer screening,Yearly,Low-dose CT scan if significant smoking history,smoker
40-49,all,Liver fibrosis screening,Every 2 years,To detect early liver damage,"smoker, heavyDrinker"
40-49,all,Cardiac stress test,Every 2-3 years,To assess heart function during exercise,"smoker, heavyDrinker, sedentary"
50-64,all,Diabetes screening,Every 3 years,More frequently with risk factors,all
50-64,all,Colorectal cancer screening,Start at 45-50,Colonoscopy every 10 years or other tests,all
50-64,all,Hepatitis C screening,Once,For those born between 1945-1965,all
50-64,all,Lung cancer screening,Yearly,If significant smoking history,all
50-64,all,Shingles vaccine,Once at 50+,Recommended for adults 50+,all
50-64,female,Pap smear,Every 3 years,Or HPV co-testing every 5 years,all
50-64,female,Mammogram,Every 1-2 years,Based on risk factors,all
50-64,female,Bone density screening,Discuss with doctor,Based on risk factors,all
50-64,male,Prostate cancer screening,Discuss with doctor,Based on risk factors,all
50-64,all,Low-dose CT scan,Yearly,For current smokers or those who quit within 15 years,smoker
50-64,all,Cardiovascular disease screening,Yearly,Comprehensive assessment including stress test,"smoker, heavyDrinker, sedentary"
50-64,all,Peripheral artery disease screening,Every 2 years,Ankle-brachial index test,"smoker, sedentary"
50-64,all,Comprehensive liver assessment,Yearly,Including ultrasound for heavy drinkers,heavyDrinker
65+,all,Diabetes screening,Every 3 years,More frequently with risk factors,all
65+,all,Colorectal cancer screening,Through age 75,Discuss with doctor after 75,all
65+,all,Pneumonia vaccine,Once,As recommended by doctor,all
65+,all,Shingles vaccine,Once,If not received earlier,all
65+,all,Hearing test,As needed,Discuss with doctor,all
65+,all,Abdominal aortic aneurysm,Once,For men who have smoked,smoker
65+,all,Fall risk assessment,Yearly,Discuss home safety,all
65+,female,Pap smear,Discuss with doctor,May be discontinued after 65 if previous tests normal,all
65+,female,Mammogram,Every 1-2 years,Discuss with doctor,all
65+,female,Bone density screening,At least once,Follow-up based on results,all
65+,male,Prostate cancer screening,Discuss with doctor,Based on risk factors,all
65+,all,Low-dose CT scan,Yearly,For current smokers or those who quit within 15 years,smoker
65+,all,Advanced cardiovascular screening,Yearly,To assess heart function and vascular health,"smoker, heavyDrinker, sedentary"
65+,all,Balance and gait assessment,Yearly,To prevent falls,"heavyDrinker, sedentary"
65+,all,Cognitive assessment,Yearly,Memory and cognitive function,heavyDrinker`;

        // Parse the mock data
        const baseResults = Papa.parse(mockBaseData, {
          header: true,
          skipEmptyLines: true
        });
        
        const ageSpecificResults = Papa.parse(mockAgeSpecificData, {
          header: true,
          skipEmptyLines: true
        });
        
        // Process age-specific data into organized structure
        const ageSpecificRecs = {};
        ageSpecificResults.data.forEach(row => {
          if (!ageSpecificRecs[row.ageGroup]) {
            ageSpecificRecs[row.ageGroup] = {
              all: [],
              female: [],
              male: []
            };
          }
          
          const test = {
            test: row.test,
            frequency: row.frequency,
            notes: row.notes,
            riskFactors: row.riskFactors ? row.riskFactors.split(', ') : ['all']
          };
          
          if (row.gender === 'all') {
            ageSpecificRecs[row.ageGroup].all.push(test);
          } else {
            ageSpecificRecs[row.ageGroup][row.gender].push(test);
          }
        });
        
        setHealthData({
          baseRecommendations: baseResults.data.map(item => ({
            ...item,
            riskFactors: item.riskFactors ? item.riskFactors.split(', ') : ['all']
          })),
          ageSpecificRecommendations: ageSpecificRecs
        });
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load health recommendations. Please try again later.");
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Determine if a recommendation applies based on risk factors
  const isApplicableRecommendation = (recommendation) => {
    // Safety check - if recommendation is undefined, return false
    if (!recommendation || !recommendation.riskFactors) return false;
    
    // If the recommendation applies to all, include it
    if (recommendation.riskFactors.includes('all')) {
      return true;
    }
    
    // Create an array of the user's risk factors
    const userRiskFactors = [];
    if (smokingStatus === 'yes') userRiskFactors.push('smoker');
    if (alcoholConsumption === 'heavy') userRiskFactors.push('heavyDrinker');
    if (physicalActivity === 'sedentary') userRiskFactors.push('sedentary');
    
    // Check if any of the user's risk factors match the recommendation's risk factors
    return recommendation.riskFactors.some(factor => userRiskFactors.includes(factor));
  };

  const getRecommendations = () => {
    const ageNum = parseInt(age);
    let ageGroup;
    
    // Determine age group
    if (ageNum >= 18 && ageNum <= 39) ageGroup = "18-39";
    else if (ageNum >= 40 && ageNum <= 49) ageGroup = "40-49";
    else if (ageNum >= 50 && ageNum <= 64) ageGroup = "50-64";
    else if (ageNum >= 65) ageGroup = "65+";
    
    // Get health screening recommendations - with safety checks
    let baseRecs = [];
    let ageSpecificRecs = [];
    
    // Safely filter base recommendations
    if (Array.isArray(healthData.baseRecommendations)) {
      baseRecs = healthData.baseRecommendations.filter(isApplicableRecommendation);
    }
    
    // Safely get age-specific recommendations
    if (healthData.ageSpecificRecommendations && 
        healthData.ageSpecificRecommendations[ageGroup]) {
      
      // Add general recommendations for this age group
      if (Array.isArray(healthData.ageSpecificRecommendations[ageGroup].all)) {
        const generalRecs = healthData.ageSpecificRecommendations[ageGroup].all.filter(isApplicableRecommendation);
        ageSpecificRecs = [...generalRecs];
      }
      
      // Add gender-specific recommendations
      if ((gender === 'female' || gender === 'male') && 
          Array.isArray(healthData.ageSpecificRecommendations[ageGroup][gender])) {
        const genderRecs = healthData.ageSpecificRecommendations[ageGroup][gender].filter(isApplicableRecommendation);
        ageSpecificRecs = [...ageSpecificRecs, ...genderRecs];
      }
    }
    
    setRecommendations([...baseRecs, ...ageSpecificRecs]);
    
    // Get fitness recommendations - with safety checks
    let allAgeFitnessRecs = [];
    let ageSpecificFitnessRecs = [];
    
    // Safely filter fitness recommendations
    if (Array.isArray(healthData.fitnessRecommendations)) {
      allAgeFitnessRecs = healthData.fitnessRecommendations
        .filter(rec => rec && rec.ageGroup === 'all')
        .filter(isApplicableRecommendation);
        
      ageSpecificFitnessRecs = healthData.fitnessRecommendations
        .filter(rec => rec && rec.ageGroup === ageGroup)
        .filter(isApplicableRecommendation);
    }
      
    setFitnessRecommendations([...allAgeFitnessRecs, ...ageSpecificFitnessRecs]);
    
    setShowForm(false);
  };

  const handleBack = () => {
    setRecommendations(null);
    setShowForm(true);
  };

  // Age calculation for eye exam frequency
  const getEyeExamFrequency = (age) => {
    const ageNum = parseInt(age);
    return ageNum < 40 ? "Every 2-3 years" : "Yearly";
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg text-center">
        <h1 className="text-3xl font-bold mb-6 text-blue-700">Health Helper</h1>
        <div className="p-6">
          <p className="text-gray-700">Loading health recommendations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-6 text-blue-700">Health Helper</h1>
        <div className="p-6 bg-red-50 rounded-lg">
          <p className="text-red-600">{error}</p>
          <p className="mt-4">Please check your internet connection and try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-center mb-6 text-blue-700">Health Helper</h1>
      <h2 className="text-xl text-center mb-6 text-gray-600">Personalized Health Screening Recommendations</h2>
      
      {showForm ? (
        <div className="bg-blue-50 p-6 rounded-lg">
          <p className="mb-4 text-gray-700">Enter your information to get personalized health screening recommendations based on your age, gender, and lifestyle factors.</p>
          
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Age*</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your age"
              min="18"
              max="120"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Gender (for specific health recommendations)</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select gender</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other/Prefer not to say</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Do you smoke or have you smoked in the past 15 years?</label>
            <select
              value={smokingStatus}
              onChange={(e) => setSmokingStatus(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select option</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">How would you describe your alcohol consumption?</label>
            <select
              value={alcoholConsumption}
              onChange={(e) => setAlcoholConsumption(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select option</option>
              <option value="none">None</option>
              <option value="light">Light (1-2 drinks per week)</option>
              <option value="moderate">Moderate (3-7 drinks per week)</option>
              <option value="heavy">Heavy (8+ drinks per week)</option>
            </select>
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">How much physical activity do you get per week?</label>
            <select
              value={physicalActivity}
              onChange={(e) => setPhysicalActivity(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select option</option>
              <option value="sedentary">Sedentary (Less than 30 minutes)</option>
              <option value="light">Light (30-60 minutes)</option>
              <option value="moderate">Moderate (1-3 hours)</option>
              <option value="active">Active (3+ hours)</option>
            </select>
          </div>
          
          <button
            onClick={getRecommendations}
            disabled={!age}
            className="w-full bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400"
          >
            Get Recommendations
          </button>
        </div>
      ) : (
        <div>
          <div className="bg-blue-50 p-6 rounded-lg mb-6">
            <h3 className="text-xl font-semibold mb-4">Your Personalized Health Plan</h3>
            <p className="mb-2 text-gray-700">Age: {age}</p>
            {gender && <p className="mb-2 text-gray-700">Gender: {gender}</p>}
            {smokingStatus && <p className="mb-2 text-gray-700">Smoking Status: {smokingStatus === 'yes' ? 'Current or recent smoker' : 'Non-smoker'}</p>}
            {alcoholConsumption && <p className="mb-2 text-gray-700">Alcohol Consumption: {alcoholConsumption}</p>}
            {physicalActivity && <p className="mb-4 text-gray-700">Physical Activity: {physicalActivity}</p>}
            <div className="italic text-sm text-gray-600 mb-4">
              Note: These are general guidelines. Please consult with healthcare providers for personalized advice.
            </div>
          </div>
          
          {/* Health Screenings Section */}
          <div className="mb-8">
            <div className="bg-blue-600 text-white p-4 rounded-t-lg">
              <h3 className="text-xl font-bold">Recommended Health Screenings</h3>
            </div>
            
            <div className="overflow-x-auto border border-gray-200 rounded-b-lg">
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="bg-blue-100">
                    <th className="py-3 px-4 text-left border-b">Screening/Test</th>
                    <th className="py-3 px-4 text-left border-b">Frequency</th>
                    <th className="py-3 px-4 text-left border-b">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {recommendations.map((rec, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="py-3 px-4 border-b font-medium">{rec.test}</td>
                      <td className="py-3 px-4 border-b">{rec.frequency === 'Eye exam frequency based on age' ? getEyeExamFrequency(age) : rec.frequency}</td>
                      <td className="py-3 px-4 border-b text-gray-600">{rec.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Physical Activity Section */}
          {fitnessRecommendations && fitnessRecommendations.length > 0 && (
            <div className="mb-8">
              <div className="bg-green-600 text-white p-4 rounded-t-lg">
                <h3 className="text-xl font-bold">Recommended Physical Activity</h3>
              </div>
              
              <div className="overflow-x-auto border border-gray-200 rounded-b-lg">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr className="bg-green-100">
                      <th className="py-3 px-4 text-left border-b">Activity Type</th>
                      <th className="py-3 px-4 text-left border-b">Frequency</th>
                      <th className="py-3 px-4 text-left border-b">Duration</th>
                      <th className="py-3 px-4 text-left border-b">Intensity</th>
                      <th className="py-3 px-4 text-left border-b">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fitnessRecommendations.map((rec, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="py-3 px-4 border-b font-medium">{rec.activityType}</td>
                        <td className="py-3 px-4 border-b">{rec.frequency}</td>
                        <td className="py-3 px-4 border-b">{rec.duration}</td>
                        <td className="py-3 px-4 border-b">{rec.intensity}</td>
                        <td className="py-3 px-4 border-b text-gray-600">{rec.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          <div className="mt-6">
            <button
              onClick={handleBack}
              className="bg-gray-200 text-gray-800 p-3 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Back to Form
            </button>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm text-gray-600">
              <p className="font-medium mb-2">Important Reminders:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>These recommendations are based on general guidelines from health organizations.</li>
                <li>Your personal health history may require different screenings or frequencies.</li>
                <li>Always consult with your healthcare provider for personalized advice.</li>
                <li>Some screenings may start earlier if you have family history or risk factors.</li>
                <li>Start any new exercise program gradually, especially if you've been inactive.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-8 pt-4 border-t text-xs text-gray-500">
        <p>Health and fitness recommendation data is maintained for easy updates and management.</p>
        <p className="mt-1">Last updated: March 11, 2025</p>
      </div>
    </div>
  );
};

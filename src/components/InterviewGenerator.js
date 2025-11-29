import React, { useState } from "react";
import { interviewService } from "../services/api.service";
import { useNavigate } from "react-router-dom";
import {
  DashboardContainer,
  DashboardContent,
  DashboardHeader,
  DashboardTitle,
  DashboardSubtitle,
  DashboardCard,
  Button,
  TagInput,
} from "./ui";
import styled from "styled-components";

const FormContainer = styled(DashboardCard)`
  min-width: 500px;
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;

  @media (max-width: 600px) {
    min-width: 100%;
  }
`;

const FormGroup = styled.div`
  margin-bottom: ${(props) => props.theme.spacing.lg};
`;

const Label = styled.label`
  display: block;
  font-weight: 500;
  color: ${(props) => props.theme.colors.gray[700]};
  font-size: 0.875rem;
  margin-bottom: ${(props) => props.theme.spacing.sm};
  text-align: left;
  cursor: pointer;
`;

const InputWrapper = styled.div`
  width: 100%;
`;

const Input = styled.input`
  width: 100%;
  padding: ${(props) => props.theme.spacing.sm}
    ${(props) => props.theme.spacing.md};
  border: 1px solid ${(props) => props.theme.colors.gray[300]};
  border-radius: ${(props) => props.theme.borderRadius.md};
  font-size: 1rem;
  box-sizing: border-box;
  transition: all ${(props) => props.theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${(props) => props.theme.colors.primaryLight}33;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: ${(props) => props.theme.spacing.sm}
    ${(props) => props.theme.spacing.md};
  border: 1px solid ${(props) => props.theme.colors.gray[300]};
  border-radius: ${(props) => props.theme.borderRadius.md};
  font-size: 1rem;
  background: ${(props) => props.theme.colors.white};
  box-sizing: border-box;
  transition: all ${(props) => props.theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${(props) => props.theme.colors.primaryLight}33;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: ${(props) => props.theme.spacing.sm}
    ${(props) => props.theme.spacing.md};
  border: 1px solid ${(props) => props.theme.colors.gray[300]};
  border-radius: ${(props) => props.theme.borderRadius.md};
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  box-sizing: border-box;
  transition: all ${(props) => props.theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${(props) => props.theme.colors.primaryLight}33;
  }
`;

const ErrorMessage = styled.div`
  color: ${(props) => props.theme.colors.danger};
  margin-bottom: ${(props) => props.theme.spacing.md};
  padding: ${(props) => props.theme.spacing.sm};
  background: ${(props) => props.theme.colors.danger}15;
  border-radius: ${(props) => props.theme.borderRadius.md};
  font-size: 0.875rem;
`;

const InterviewGenerator = () => {
  const [skills, setSkills] = useState([]);
  const [questionsPerSkill, setQuestionsPerSkill] = useState(3);
  const [questionsPerSkillInput, setQuestionsPerSkillInput] = useState("3");
  const [difficulty, setDifficulty] = useState("intermediate");
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (skills.length === 0) {
      setError("Please enter at least one skill");
      return;
    }

    if (!questionsPerSkill || questionsPerSkill < 1 || questionsPerSkill > 4) {
      setError("Please enter a valid number of questions per skill (1-4)");
      return;
    }

    setLoading(true);

    try {
      const interview = await interviewService.generateInterview(
        skills,
        questionsPerSkill,
        difficulty,
        context
      );

      navigate(`/interview/${interview.id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate interview");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardContainer>
      <DashboardContent maxWidth="800px">
        <DashboardHeader>
          <DashboardTitle>Generate Interview</DashboardTitle>
          <DashboardSubtitle>
            Create a new technical interview by specifying skills and parameters
          </DashboardSubtitle>
        </DashboardHeader>

        <FormContainer>
          <form onSubmit={handleSubmit}>
            <FormGroup>
              <Label htmlFor="skills">Skills</Label>
              <TagInput
                id="skills"
                value={skills}
                onChange={setSkills}
                placeholder="Type a skill and press Enter"
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="questionsPerSkill">Questions per skill</Label>
              <InputWrapper>
                <Input
                  id="questionsPerSkill"
                  type="number"
                  value={questionsPerSkillInput}
                  onChange={(e) => {
                    const value = e.target.value;
                    setQuestionsPerSkillInput(value);
                    const numValue = parseInt(value, 10);
                    if (!isNaN(numValue) && numValue >= 1 && numValue <= 4) {
                      setQuestionsPerSkill(numValue);
                    }
                  }}
                  onBlur={(e) => {
                    const numValue = parseInt(e.target.value, 10);
                    if (isNaN(numValue) || numValue < 1) {
                      setQuestionsPerSkill(1);
                      setQuestionsPerSkillInput("1");
                    } else if (numValue > 4) {
                      setQuestionsPerSkill(4);
                      setQuestionsPerSkillInput("4");
                    } else {
                      setQuestionsPerSkillInput(numValue.toString());
                    }
                  }}
                  min="1"
                  max="4"
                  required
                />
              </InputWrapper>
            </FormGroup>

            <FormGroup>
              <Label htmlFor="difficulty">Difficulty</Label>
              <InputWrapper>
                <Select
                  id="difficulty"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </Select>
              </InputWrapper>
            </FormGroup>

            <FormGroup>
              <Label htmlFor="context">Context (optional)</Label>
              <InputWrapper>
                <Textarea
                  id="context"
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="Additional context for the interview..."
                  rows="3"
                />
              </InputWrapper>
            </FormGroup>

            {error && <ErrorMessage>{error}</ErrorMessage>}

            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={loading || skills.length === 0 || !questionsPerSkill}
              size="lg"
            >
              {loading ? "Generating..." : "Generate Interview"}
            </Button>
          </form>
        </FormContainer>
      </DashboardContent>
    </DashboardContainer>
  );
};

export default InterviewGenerator;

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

type FastqsQualitySliderProps = {
  value: number;
  onValueChange: (value: number) => void;
  disabled?: boolean;
  id?: string;
};

export function FastqsQualitySlider({
  value,
  onValueChange,
  disabled = false,
  id,
}: FastqsQualitySliderProps) {
  function handleSliderChange(sliderValue: number[]) {
    onValueChange(sliderValue[0]);
  }

  return (
    <div>
      <Label htmlFor={id} className="font-semibold">
        Quality
      </Label>
      <div className="mt-2">
        <Slider
          id={id}
          value={[value]}
          onValueChange={handleSliderChange}
          min={1}
          max={5}
          step={1}
          disabled={disabled}
        />
      </div>
    </div>
  );
}

<template>
  <div>
    <Button>Click me</Button>
    <Input />
    <Label>Name</Label>
    <Textarea />
    <Select>
      <SelectTrigger>
        <SelectValue placeholder="Select an option" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="1">Option 1</SelectItem> 
        <SelectItem value="2">Option 2</SelectItem>
        <SelectItem value="3">Option 3</SelectItem>
      </SelectContent>
    </Select>
    <Checkbox />
    <RadioGroup>
      <RadioGroupItem value="1">Option 1</RadioGroupItem>
      <RadioGroupItem value="2">Option 2</RadioGroupItem>
      <RadioGroupItem value="3">Option 3</RadioGroupItem>
    </RadioGroup>
    <Switch />
    <Slider />
  </div>
</template>

<script setup lang="ts">
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Textarea } from "~/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Checkbox } from "~/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group"
import { Switch } from "~/components/ui/switch"
import { Slider } from "~/components/ui/slider"
</script>

import * as React from "react";
import { LayoutChangeEvent, Text, View } from "react-native";
import { PropsWithChildren } from "react";
import { scaleLinear, scalePoint } from "d3-scale";
import { Point, Scales } from "./types";
import {
  Canvas,
  Group,
  Rect,
  rect,
  useValue,
  mix,
} from "@shopify/react-native-skia";
import { CHART_HORIZONTAL_PADDING, CHART_VERTICAL_PADDING } from "./consts";
import {
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

type Props<T extends Point> = {
  data: T[];
};

export function CartesianChart<T extends Point>({
  data,
  children,
}: PropsWithChildren<Props<T>>) {
  const size = useSharedValue({ width: 0, height: 0 });

  // Managing
  const [canvasDimensions, setCanvasDimensions] = React.useState([0, 0]);
  const onLayout = React.useCallback(
    ({ nativeEvent: { layout } }: LayoutChangeEvent) => {
      setCanvasDimensions([layout.width, layout.height]);
    },
    [],
  );

  const ixmin = useSharedValue(Math.min(...data.map((d) => d.x)));
  const ixmax = useSharedValue(Math.max(...data.map((d) => d.x)));
  // const iymin = useSharedValue(Math.min(...data.map((d) => d.y)));
  const iymin = useSharedValue(0);
  const iymax = useSharedValue(Math.max(...data.map((d) => d.y)));
  const oxmin = useDerivedValue(() => CHART_HORIZONTAL_PADDING);
  const oxmax = useDerivedValue(
    () => size.value.width - CHART_HORIZONTAL_PADDING,
    [size],
  );
  const oymin = useDerivedValue(
    () => size.value.height - CHART_VERTICAL_PADDING,
    [size],
  );
  const oymax = useDerivedValue(() => CHART_VERTICAL_PADDING);

  React.useEffect(() => {
    ixmin.value = withTiming(Math.min(...data.map((d) => d.x)), {
      duration: 300,
    });
    ixmax.value = withTiming(Math.max(...data.map((d) => d.x)), {
      duration: 300,
    });
    // iymin.value = withTiming(Math.min(...data.map((d) => d.y)), {
    //   duration: 300,
    // });
    iymax.value = withTiming(Math.max(...data.map((d) => d.y)), {
      duration: 300,
    });
  }, [data]);

  const c = React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) return null;
    return React.cloneElement(child, {
      data,
      ixmin,
      ixmax,
      iymin,
      iymax,
      oxmin,
      oxmax,
      oymin,
      oymax,
    });
  });

  return (
    <Canvas style={{ flex: 1 }} onLayout={onLayout} onSize={size}>
      {c}
    </Canvas>
  );
}
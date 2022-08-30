import React, { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  formatDay,
  msInDay,
  redondear,
  rojoClaro,
  tipoRedondeo,
  enumToArray,
  mayusFirstLetter,
  areListsEqual,
} from "../../../../../constants";
import SelectorDeslizable from "../../../../components/SelectorDeslizable";

import { FontAwesome5 } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";

import DateTimePickerModal from "react-native-modal-datetime-picker";
import Boton from "../../../../components/Boton";
import { ComoditiesEnum, MusicEnum, PlaceEnum } from "../../../../models";

export type filterResult = {
  precioMin?: number;
  precioMax?: number;
  dist?: number;
  fechaMin?: Date;
  fechaMax?: Date;
  musica: MusicEnum[];
  comodities: ComoditiesEnum[];
  lugar: PlaceEnum[];
};

export default function ({
  setModalVisible,
  modalVisible,
  maxPrice,
  minPrice,
  handleSearch,

  prevFilters,
}: {
  maxPrice?: number;
  minPrice?: number;
  modalVisible: boolean;

  prevFilters: filterResult;

  setModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  handleSearch: (t: filterResult) => void;
}) {
  // Estado de filtros previo si existe
  const {
    dist: prevDist,
    fechaMax: prevFechaMax,
    fechaMin: prevFechaMin,
    precioMax: prevPrecioMax,
    precioMin: prevPrecioMin,

    musica: prevAmbiente,
    comodities: prevComodities,
    lugar: prevLugar,
  } = prevFilters;

  const musicList = enumToArray(MusicEnum);
  const comoditiesList = enumToArray(ComoditiesEnum);
  const lugarList = enumToArray(PlaceEnum);

  // Precio maximo redondeado al 50 mas alto
  const maximumValue = redondear(maxPrice, 50, tipoRedondeo.ARRIBA);
  // Precio minimo redondeado al 50 mas bajo
  const minimumValue = redondear(minPrice, 50, tipoRedondeo.ABAJO);

  const [innerModal, setInnerModal] = useState(false);
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);

  // Estado para cuando se hace click en una
  const [fechaInicial, setFechaInicial] = useState(true);

  // Enums
  const [musica, setMusica] = useState(prevAmbiente);
  const [comodities, setComodities] = useState(prevComodities);
  const [lugar, setLugar] = useState(prevLugar);

  // Mostrar enums
  // Verificar si alguno no existe
  const [showAmbiente, setShowAmbiente] = useState(
    !areListsEqual(prevAmbiente, musicList)
  );
  const [showLugar, setShowLugar] = useState(
    !areListsEqual(prevLugar, lugarList)
  );
  const [showComodities, setShowComodities] = useState(
    !areListsEqual(prevComodities, [])
  );

  // Variables del precio
  const [precio, setPrecio] = useState([
    prevPrecioMin ? prevPrecioMin : minimumValue,
    prevPrecioMax ? prevPrecioMax : maximumValue,
  ]);

  const maxDistance = 40;
  const [distancia, setDistancia]: [p: null | number[], setDistancia: any] =
    useState(prevDist ? [prevDist] : null);

  const minDate = new Date();
  const maxDate = new Date(minDate.getTime() + msInDay * 365);

  const [dateRange, setDateRange]: [
    p: null | (Date | undefined)[],
    setPrecio: any
  ] = useState(
    prevFechaMin || prevFechaMax ? [prevFechaMin, prevFechaMax] : null
  );

  useEffect(() => {
    setInnerModal(true);
  }, []);

  enum dateType {
    INICIAL = "INICIAL",
    FINAL = "FINAL",
  }

  function openDatePicker(type: dateType) {
    setFechaInicial(type === dateType.INICIAL);
    setIsDatePickerVisible(true);
  }

  function handleCloseModal() {
    setInnerModal(false);
    setModalVisible(false);
  }

  function hideDatePicker() {
    setIsDatePickerVisible(false);
  }
  function handleConfirmDate(date: Date) {
    setIsDatePickerVisible(false);

    // Si la nueva fecha inicial es mayor a la fecha final se hace un dia menos
    if (dateRange && dateRange[1] && fechaInicial && date >= dateRange[1]) {
      date = new Date(dateRange[1].getTime() - msInDay);
    }

    // Si la nueva fecha final es menor a la fecha inicial se hace un dia mas
    if (dateRange && dateRange[0] && !fechaInicial && date <= dateRange[0]) {
      date = new Date(dateRange[0].getTime() + msInDay);
    }

    setDateRange((old: Date[] | null) => {
      let ne: any[];
      if (old) {
        ne = [...old];
      } else {
        ne = [];
      }
      ne[fechaInicial ? 0 : 1] = date;
      return ne;
    });
  }

  function handleSave(close?: boolean, resetAll?: boolean) {
    const precioMin = resetAll ? minimumValue : precio[0];
    const precioMax = resetAll ? maximumValue : precio[1];
    const dist = distancia && !resetAll ? distancia[0] : undefined;

    const fechaMin = dateRange && !resetAll ? dateRange[0] : undefined;
    const fechaMax = dateRange && !resetAll ? dateRange[1] : undefined;

    const mus = !resetAll && showAmbiente ? musica : musicList;
    const pl = !resetAll && showLugar ? lugar : lugarList;
    const com = !resetAll && showComodities ? comodities : [];

    if (resetAll) {
      // Reiniciar enums
      setMusica(mus);
      setLugar(pl);
      setComodities([]);

      // Limpiar precio
      setPrecio([precioMin, precioMax]);
      setTimeout(() => {
        // Error de flickering
        setPrecio([precioMin, precioMax]);
      }, 1);

      // Limpiar distancia
      setDistancia(dist);
      setTimeout(() => {
        // Error de flickering
        setDistancia(dist);
      }, 1);

      setDateRange(undefined);
    }

    close && handleCloseModal();
    close &&
      handleSearch({
        precioMin,
        precioMax,
        dist,
        fechaMin,
        fechaMax,

        // ENUMS
        lugar: pl,
        comodities: com,
        musica: mus,
      });
  }

  const insets = useSafeAreaInsets();
  return (
    <Modal
      animationType="none"
      statusBarTranslucent={true}
      transparent={true}
      visible={modalVisible}
      onRequestClose={handleCloseModal}
    >
      <View style={styles.container}>
        <Modal
          animationType="slide"
          transparent={true}
          visible={innerModal}
          onRequestClose={handleCloseModal}
        >
          <Pressable onPress={handleCloseModal} style={{ flex: 1 }} />
          {/* Linea de cerrar el modal */}
          <Pressable
            onPress={handleCloseModal}
            style={{
              width: "100%",
              paddingBottom: 15,
              alignItems: "center",
              ...styles.innerContainer,
            }}
          >
            <View style={styles.line} />
          </Pressable>

          <View>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                backgroundColor: "#fff",
                paddingTop: 0,
                padding: 15,
              }}
            >
              {/* Lista de filtros */}

              {/* Por precio */}
              <View style={styles.filterContainer}>
                {/* Titulo */}
                <Text style={styles.tituloFiltro}>Precio</Text>
                <Text style={styles.valorFiltro}>
                  {"$" + precio[0] + " - $" + precio[1]}
                </Text>

                <View style={{ marginTop: 7 }} />

                {/* Control */}
                <SelectorDeslizable
                  style={{ marginTop: 5 }}
                  setValue={setPrecio}
                  value={precio}
                  maximumValue={maximumValue}
                  minimumValue={minimumValue}
                  prefix={"$"}
                  step={50}
                />
              </View>

              {/* Por distancia a mi ubicacion (manejar permisos de ubicacion) */}
              <View style={styles.filterContainer}>
                {/* Titulo */}
                <Text style={styles.tituloFiltro}>Radio de distancia</Text>
                <Text style={styles.valorFiltro}>
                  {distancia && distancia[0]
                    ? distancia[0] + " km"
                    : "Cualquiera"}
                </Text>

                <View style={{ marginTop: 7 }} />

                {/* Control */}
                <SelectorDeslizable
                  style={{ marginTop: 5 }}
                  setValue={setDistancia}
                  value={distancia ? distancia : [0]}
                  maximumValue={maxDistance}
                  minimumValue={0}
                  step={1}
                  sufix={" km"}
                  placeholderStyle={{ width: 55, left: -17 }}
                />
              </View>

              {/* Por fecha (Rango de fechas)*/}
              <View style={styles.filterContainer}>
                <View style={{ ...styles.row }}>
                  <Pressable
                    onPress={() => openDatePicker(dateType.INICIAL)}
                    style={styles.dateButton}
                  >
                    <FontAwesome5
                      name="calendar-alt"
                      size={24}
                      color={rojoClaro + "aa"}
                    />
                    <View style={styles.textDateContaienr}>
                      <Text style={{ color: "#888" }}>Desde</Text>
                      <Text>{formatDay(dateRange ? dateRange[0] : null)}</Text>
                    </View>
                  </Pressable>

                  {/* Linea divisora */}
                  <View style={styles.verticalLine} />

                  <Pressable
                    onPress={() => openDatePicker(dateType.FINAL)}
                    style={styles.dateButton}
                  >
                    <FontAwesome5
                      name="calendar-alt"
                      size={24}
                      color={rojoClaro + "aa"}
                    />
                    <View style={styles.textDateContaienr}>
                      <Text style={{ color: "#888" }}>Hasta</Text>
                      <Text>{formatDay(dateRange ? dateRange[1] : null)}</Text>
                    </View>
                  </Pressable>
                </View>
              </View>

              {/* Tipo de musica */}
              <Pressable
                onPress={() => setShowAmbiente(!showAmbiente)}
                style={styles.filterContainer}
              >
                {/* Titulo */}
                <View
                  style={{
                    paddingVertical: 10,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text style={styles.tituloFiltro}>Ambiente</Text>
                  <AntDesign
                    name={showAmbiente ? "up" : "down"}
                    size={24}
                    color="black"
                  />
                </View>

                {showAmbiente && (
                  <View style={styles.enumsContainer}>
                    {musicList.map((e, idx) => {
                      const selected = musica.find((r) => r === e);
                      function onPress() {
                        const idx = musica.findIndex((r) => r === e);

                        let nMusic = [...musica];
                        // Si no existe el elemento agregarlo
                        if (idx < 0) {
                          nMusic.push(e);
                        } else {
                          // Verificar que no sea el ultimo elemento
                          if (musica.length !== 1) {
                            nMusic.splice(idx, 1);
                          }
                        }

                        setMusica(nMusic);
                      }

                      return (
                        <Pressable
                          key={e}
                          onPress={onPress}
                          style={{
                            ...styles.botonEnum,
                            backgroundColor: selected ? rojoClaro : "#f0f0f0",
                          }}
                        >
                          <Text
                            style={{
                              ...styles.enumTxt,
                              color: selected ? "#fff" : "#888",
                            }}
                          >
                            {mayusFirstLetter(e)}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                )}
              </Pressable>

              {/* Comodities */}
              <Pressable
                onPress={() => setShowComodities(!showComodities)}
                style={styles.filterContainer}
              >
                {/* Titulo */}
                <View
                  style={{
                    paddingVertical: 10,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text style={styles.tituloFiltro}>Comodities</Text>
                  <AntDesign
                    name={showComodities ? "up" : "down"}
                    size={24}
                    color="black"
                  />
                </View>

                {showComodities && (
                  <View style={styles.enumsContainer}>
                    {comoditiesList.map((e, idx) => {
                      const selected = comodities.find((r) => r === e);
                      function onPress() {
                        const idx = comodities.findIndex((r) => r === e);

                        let ne = [...comodities];
                        // Si no existe el elemento agregarlo
                        if (idx < 0) {
                          ne.push(e);
                        } else {
                          ne.splice(idx, 1);
                        }

                        setComodities(ne);
                      }

                      return (
                        <Pressable
                          key={e}
                          onPress={onPress}
                          style={{
                            ...styles.botonEnum,
                            backgroundColor: selected ? rojoClaro : "#f0f0f0",
                          }}
                        >
                          <Text
                            style={{
                              ...styles.enumTxt,
                              color: selected ? "#fff" : "#888",
                            }}
                          >
                            {mayusFirstLetter(e)}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                )}
              </Pressable>

              {/* Comodities */}
              <Pressable
                onPress={() => setShowLugar(!showLugar)}
                style={styles.filterContainer}
              >
                {/* Titulo */}
                <View
                  style={{
                    paddingVertical: 10,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text style={styles.tituloFiltro}>Lugar</Text>
                  <AntDesign
                    name={showLugar ? "up" : "down"}
                    size={24}
                    color="black"
                  />
                </View>

                {showLugar && (
                  <View style={styles.enumsContainer}>
                    {lugarList.map((e, idx) => {
                      const selected = lugar.find((r) => r === e);
                      function onPress() {
                        const idx = lugar.findIndex((r) => r === e);

                        let ne = [...lugar];
                        // Si no existe el elemento agregarlo
                        if (idx < 0) {
                          ne.push(e);
                        } else {
                          if (lugar.length !== 1) {
                            ne.splice(idx, 1);
                          }
                        }

                        setLugar(ne);
                      }

                      return (
                        <Pressable
                          key={e}
                          onPress={onPress}
                          style={{
                            ...styles.botonEnum,
                            backgroundColor: selected ? rojoClaro : "#f0f0f0",
                          }}
                        >
                          <Text
                            style={{
                              ...styles.enumTxt,
                              color: selected ? "#fff" : "#888",
                            }}
                          >
                            {mayusFirstLetter(e)}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                )}
              </Pressable>

              {/* Por comodities (botones)*/}
              <View style={{ height: 120 }} />
            </ScrollView>
          </View>
          <View style={styles.buttonContainer}>
            <Boton
              style={{
                flex: 1,
                backgroundColor: rojoClaro,
                borderRadius: 15,
              }}
              titulo="Aplicar"
              onPress={() => handleSave(true)}
            />

            {/* Reiniciar */}
            <TouchableOpacity onPress={() => handleSave(false, true)}>
              <Text style={styles.resetTxt}>Reiniciar</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </View>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        date={dateRange ? dateRange[fechaInicial ? 0 : 1] : minDate}
        minimumDate={minDate}
        maximumDate={maxDate}
        onConfirm={handleConfirmDate}
        onCancel={hideDatePicker}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0000007a",
  },

  innerContainer: {
    backgroundColor: "#fff",
    borderTopRightRadius: 25,
    borderTopLeftRadius: 25,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  tituloFiltro: {
    fontSize: 16,
    color: "#000",
    fontWeight: "bold",
  },

  filterContainer: {
    marginBottom: 20,
  },

  line: {
    paddingTop: 15,
    width: 100,
    borderBottomWidth: 1,
    borderColor: "#888",
  },

  valorFiltro: {
    color: "#888",
    fontSize: 16,
  },

  dateButton: {
    padding: 10,
    paddingLeft: 40,
    flexDirection: "row",
    flex: 1,
    alignItems: "center",
  },

  textDateContaienr: {
    marginLeft: 10,
  },

  verticalLine: {
    height: "100%",
    width: 1,
    backgroundColor: "#888",
  },

  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",

    padding: 20,
    backgroundColor: "#fff",
    bottom: 0,
  },

  resetTxt: {
    padding: 20,
    color: "#888",
  },
  enumsContainer: {
    flexWrap: "wrap",
    flexDirection: "row",
  },

  enumTxt: {
    color: "#fff",
    fontWeight: "600",
  },

  botonEnum: {
    padding: 10,
    paddingHorizontal: 20,
    marginRight: 20,
    marginTop: 20,
    borderRadius: 10,
    backgroundColor: rojoClaro,
  },
});
